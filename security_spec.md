# Security Specification: Cross-Device Firestore Rules

## 1. Data Invariants
1. **Strict User Isolation**: Every document in `/users/{userId}` and its subcollections (such as `/users/{userId}/workspace/current`) belongs strictly to the authenticated user where `request.auth.uid == userId`.
2. **Immutable Identity**: The `uid` and `userId` fields can never be changed after document creation.
3. **Payload Sanitization**: Payloads must strictly conform to bounded sizes (e.g. `stateJson` must be a valid string under 900KB, preventing denial-of-wallet exhaustion).
4. **Default Deny**: All unspecified paths or unauthorized writes return `PERMISSION_DENIED`.
5. **No Cross-User Leaks**: Unauthenticated users cannot read or write any user records. Authenticated users cannot read or write documents belonging to any other user.

## 2. The "Dirty Dozen" Payloads (All MUST be Rejected)
1. **Unauthenticated Read on User Document**: Attempt to `GET /users/user_abc` with `request.auth = null`.
2. **Unauthenticated Write to Workspace**: Attempt to `SET /users/user_abc/workspace/current` with `request.auth = null`.
3. **Identity Spoofing on Create**: Authenticated user `user_123` attempting to create `/users/user_456` with `uid: 'user_456'`.
4. **Foreign Document Write**: Authenticated user `user_123` attempting to write `/users/user_456/workspace/current`.
5. **ID Poisoning Attack**: Attempt to use malicious path string `users/../../../etc/passwd` or oversized ID string (>128 chars).
6. **Payload Denial of Wallet Attack**: Attempt to write `stateJson` string exceeding 1,000,000 characters.
7. **Ghost Field / Shadow Field Injection**: Attempt to write unexpected admin permission keys e.g. `{ isAdmin: true, role: 'superuser' }` onto user profile.
8. **Immutability Breach**: Attempt to update `/users/user_123` with a mutated `uid: 'user_different'`.
9. **Missing Mandatory Fields**: Attempt to write `/users/user_123/workspace/current` without `userId` or without `stateJson`.
10. **Type Poisoning**: Attempt to write `stateJson` as a boolean or number instead of a string.
11. **Foreign Read in Subcollection**: Authenticated user `user_123` attempting to read `/users/user_456/workspace/current`.
12. **Blanket List Attack**: Attempting an unrestricted list query across all documents in `/users` without scoping to `request.auth.uid`.

## 3. Test Runner Specification
Tests verify that all 12 dirty payloads are denied with `PERMISSION_DENIED`, while valid authenticated reads and writes where `request.auth.uid == userId` succeed.
