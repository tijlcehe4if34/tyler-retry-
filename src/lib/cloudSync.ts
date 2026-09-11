import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { AppState } from '../types';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

interface CloudSyncCallbacks {
  onRemoteStateReceived: (remoteState: AppState) => void;
  onSyncStatusChange: (status: SyncStatus, lastSyncTime?: Date) => void;
}

class CloudSyncEngine {
  private currentUser: User | null = null;
  private unsubscribeSnapshot: Unsubscribe | null = null;
  private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private callbacks: CloudSyncCallbacks | null = null;
  private pendingStateToSave: AppState | null = null;
  private isSaving = false;
  private lastSavedJson = '';

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.initUserSync(user.uid);
        this.callbacks?.onSyncStatusChange('synced', new Date());
      } else {
        this.stopSync();
        this.callbacks?.onSyncStatusChange('idle');
      }
    });
  }

  public registerCallbacks(callbacks: CloudSyncCallbacks) {
    this.callbacks = callbacks;
    if (this.currentUser) {
      callbacks.onSyncStatusChange('synced', new Date());
    } else {
      callbacks.onSyncStatusChange('idle');
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      this.currentUser = result.user;
      this.initUserSync(result.user.uid);
      this.callbacks?.onSyncStatusChange('synced', new Date());
      return result.user;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Google Sign In error:', error);
      if (err.code === 'auth/popup-blocked') {
        const customErr = new Error('Google sign-in popup was blocked by browser. Please allow popups for this site, or open the app in a new tab.');
        (customErr as any).code = 'auth/popup-blocked';
        throw customErr;
      } else if (err.code === 'auth/popup-closed-by-user') {
        const customErr = new Error('Sign-in cancelled by user.');
        (customErr as any).code = 'auth/popup-closed-by-user';
        throw customErr;
      } else if (err.code === 'auth/cancelled-popup-request') {
        const customErr = new Error('Previous sign-in request cancelled.');
        (customErr as any).code = 'auth/cancelled-popup-request';
        throw customErr;
      } else if (err.code === 'auth/unauthorized-domain') {
        const customErr = new Error(`Domain "${typeof window !== 'undefined' ? window.location.hostname : 'this domain'}" is not authorized in Firebase Console.`);
        (customErr as any).code = 'auth/unauthorized-domain';
        throw customErr;
      }
      throw error;
    }
  }

  public async signOut(): Promise<void> {
    this.stopSync();
    await firebaseSignOut(auth);
    this.currentUser = null;
    this.callbacks?.onSyncStatusChange('idle');
  }

  private initUserSync(userId: string) {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }

    // Save/update profile metadata in background
    if (this.currentUser) {
      const userProfileRef = doc(db, 'users', userId);
      setDoc(
        userProfileRef,
        {
          uid: userId,
          email: this.currentUser.email || '',
          displayName: this.currentUser.displayName || 'Tyler',
          photoURL: (this.currentUser.photoURL || '').slice(0, 2500),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch((err) => {
        console.warn('Profile sync notice:', err);
      });
    }

    const docRef = doc(db, 'users', userId, 'workspace', 'current');

    this.callbacks?.onSyncStatusChange('syncing');

    // Subscribe to remote updates (cross-device sync)
    this.unsubscribeSnapshot = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.stateJson) {
            // Check if this remote data differs from what we just sent
            if (data.stateJson !== this.lastSavedJson) {
              try {
                const parsed = JSON.parse(data.stateJson) as AppState;
                this.lastSavedJson = data.stateJson;
                this.callbacks?.onRemoteStateReceived(parsed);
                this.callbacks?.onSyncStatusChange('synced', new Date());
              } catch (e) {
                console.error('Failed to parse remote cloud workspace state:', e);
              }
            }
          }
        } else {
          // Cloud doc doesn't exist yet, we will create it on first save
          this.callbacks?.onSyncStatusChange('synced', new Date());
        }
      },
      (error) => {
        console.warn('Firestore snapshot notice:', error);
        this.callbacks?.onSyncStatusChange('error');
      }
    );
  }

  private stopSync() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }
    this.callbacks?.onSyncStatusChange('idle');
  }

  /**
   * Debounced save to Firestore. Never blocks UI or keystrokes!
   */
  public scheduleSave(state: AppState) {
    if (!this.currentUser && !auth.currentUser) return;

    this.pendingStateToSave = state;
    this.callbacks?.onSyncStatusChange('syncing');

    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = setTimeout(() => {
      this.flushPendingSave();
    }, 600); // 600ms debounce ensures smooth typing
  }

  public async flushPendingSave(): Promise<void> {
    const user = auth.currentUser || this.currentUser;
    if (!user || !this.pendingStateToSave || this.isSaving) return;

    const stateToSave = this.pendingStateToSave;
    const userId = user.uid;
    const json = JSON.stringify(stateToSave);

    if (json === this.lastSavedJson) {
      this.callbacks?.onSyncStatusChange('synced', new Date());
      return;
    }

    this.isSaving = true;

    try {
      // Save workspace state
      const workspaceRef = doc(db, 'users', userId, 'workspace', 'current');
      await setDoc(workspaceRef, {
        userId,
        stateJson: json,
        version: 1,
        updatedAt: new Date().toISOString(),
      });

      this.lastSavedJson = json;
      this.pendingStateToSave = null;
      this.callbacks?.onSyncStatusChange('synced', new Date());
    } catch (error) {
      console.error('Failed to save workspace to Firestore:', error);
      this.callbacks?.onSyncStatusChange('error');
      // Do not throw here so user workflow is uninterrupted, local storage remains intact!
    } finally {
      this.isSaving = false;
    }
  }
}

export const cloudSync = new CloudSyncEngine();
