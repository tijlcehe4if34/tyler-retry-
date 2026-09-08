// Speech Recognition & High-Clarity Speech Synthesis for JARVIS AI Assistant

export interface SpeechEngineCallbacks {
  onStart?: () => void;
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  isPreferred: boolean;
  isNatural: boolean;
}

export interface VoicePersona {
  id: string;
  name: string;
  description: string;
  accent: string;
  rate: number;
  pitch: number;
  keywords: string[];
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: 'jarvis_executive',
    name: 'JARVIS Executive (Tony Stark Butler)',
    description: 'Articulate, composed British cadence with deliberate pauses and natural executive authority.',
    accent: 'British RP',
    rate: 0.96,
    pitch: 0.98,
    keywords: ['Ryan', 'Oliver', 'Daniel', 'Google UK English Male', 'Arthur', 'en-GB'],
  },
  {
    id: 'academic_mentor',
    name: 'Oxford Scholar & Mentor',
    description: 'Warm, intellectual, patient cadence calibrated for deep study focus and exam mastery.',
    accent: 'British Academic',
    rate: 0.93,
    pitch: 1.02,
    keywords: ['George', 'Oliver', 'Arthur', 'Daniel', 'Google UK English Male'],
  },
  {
    id: 'strategic_director',
    name: 'Strategic Command Director',
    description: 'Crisp, punchy, confident cadence with modern executive precision.',
    accent: 'Executive Natural',
    rate: 1.02,
    pitch: 0.97,
    keywords: ['Christopher', 'Guy', 'Google US English', 'Natural', 'en-US'],
  },
  {
    id: 'refined_advisor',
    name: 'Sleek Protocol Advisor',
    description: 'Silky, soothing, perfectly enunciated tone with calming clarity.',
    accent: 'Refined UK',
    rate: 0.98,
    pitch: 1.00,
    keywords: ['Sonia', 'Serena', 'Libby', 'Google UK English Female', 'Natural'],
  },
];

class SpeechEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;
  private customRate: number = 0.96; // Calibrated executive British cadence
  private customPitch: number = 0.98;
  private customVolume: number = 1.0;
  private currentPersonaId: string = 'jarvis_executive';
  private keepAliveTimer: any = null;

  constructor() {
    this.initVoices();
  }

  public initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      this.voicesLoaded = true;
      if (!this.selectedVoice) {
        this.selectedVoice = this.pickBestVoice(voices);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  public getVoicePersonas(): VoicePersona[] {
    return VOICE_PERSONAS;
  }

  public getCurrentPersonaId(): string {
    return this.currentPersonaId;
  }

  public applyPersona(personaId: string): boolean {
    const persona = VOICE_PERSONAS.find((p) => p.id === personaId);
    if (!persona) return false;

    this.currentPersonaId = persona.id;
    this.customRate = persona.rate;
    this.customPitch = persona.pitch;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        // Try finding matching voice for persona keywords
        for (const kw of persona.keywords) {
          const match = voices.find(
            (v) =>
              (v.name.toLowerCase().includes(kw.toLowerCase()) ||
                v.lang.toLowerCase().includes(kw.toLowerCase())) &&
              v.lang.startsWith('en')
          );
          if (match) {
            this.selectedVoice = match;
            break;
          }
        }
      }
    }
    return true;
  }

  /**
   * Evaluates available voices and selects the highest-quality, most articulate
   * British or crisp executive English voice suited for the JARVIS persona.
   */
  private pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice {
    // Priority order: Natural neural British voices -> Natural US -> Daniel/Oliver -> English male -> English fallback
    const priorityChecks: ((v: SpeechSynthesisVoice) => boolean)[] = [
      // 1. Natural / Online high-fidelity British voices (Edge / Chrome / Apple)
      (v) =>
        v.lang.startsWith('en-GB') &&
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online')),
      // 2. Microsoft Ryan Online (Natural) - sounds remarkably like Jarvis
      (v) => v.name.includes('Ryan') && v.lang.startsWith('en'),
      // 3. Google UK English Male (Chrome's cleanest Jarvis voice)
      (v) => v.name.includes('Google UK English Male'),
      // 4. Apple Daniel / Oliver / Arthur (macOS/iOS classic articulate British)
      (v) =>
        v.lang.startsWith('en-GB') &&
        (v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Arthur')),
      // 5. Microsoft Oliver / George / Sonia (Natural)
      (v) =>
        (v.name.includes('Oliver') ||
          v.name.includes('George') ||
          v.name.includes('Sonia') ||
          v.name.includes('Libby')) &&
        v.lang.startsWith('en'),
      // 6. Google UK English Female
      (v) => v.name.includes('Google UK English Female'),
      // 7. Any other en-GB voice
      (v) => v.lang.startsWith('en-GB') || v.lang === 'en_GB',
      // 8. Natural / Neural US voices (e.g. Christopher, Guy, Samantha Enhanced)
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Enhanced')),
      // 9. Google US English
      (v) => v.name.includes('Google US English'),
      // 10. Any English voice
      (v) => v.lang.startsWith('en'),
    ];

    for (const check of priorityChecks) {
      const match = voices.find(check);
      if (match) return match;
    }

    return voices[0];
  }

  public getAvailableVoices(): VoiceOption[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    const voices = window.speechSynthesis.getVoices() || [];

    return voices
      .filter((v) => v.lang.startsWith('en'))
      .map((v) => {
        const isNatural =
          v.name.includes('Natural') ||
          v.name.includes('Neural') ||
          v.name.includes('Enhanced') ||
          v.name.includes('Google');
        const isPreferred =
          v.name === this.selectedVoice?.name ||
          v.voiceURI === this.selectedVoice?.voiceURI;

        return {
          name: v.name,
          lang: v.lang,
          voiceURI: v.voiceURI,
          isPreferred,
          isNatural,
        };
      });
  }

  public setVoiceByURI(voiceURI: string): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.voiceURI === voiceURI || v.name === voiceURI);
    if (match) {
      this.selectedVoice = match;
      return true;
    }
    return false;
  }

  public setCadence(rate: number = 0.98, pitch: number = 1.0) {
    this.customRate = Math.max(0.7, Math.min(1.4, rate));
    this.customPitch = Math.max(0.8, Math.min(1.2, pitch));
  }

  /**
   * Pre-processes text before speech synthesis so JARVIS never stumbles on
   * emojis, markdown symbols, asterisks, URLs, or abbreviated school jargon.
   */
  public cleanTextForSpeech(rawText: string): string {
    if (!rawText) return '';

    let text = rawText;

    // 1. Remove emojis and graphical unicode symbols
    text = text.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    );

    // 2. Remove code blocks and inline code
    text = text.replace(/```[\s\S]*?```/g, 'code snippet omitted');
    text = text.replace(/`([^`]+)`/g, '$1');

    // 3. Remove Markdown links [Label](url) -> Label
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // 4. Remove bold/italics markers: **word** or *word* or __word__
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
    text = text.replace(/(\*|_)(.*?)\1/g, '$2');

    // 5. Remove headers: ### or ## or #
    text = text.replace(/^#{1,6}\s+/gm, '');

    // 6. Clean bullet lists (*, -, •, 1.)
    text = text.replace(/^[\*\-\•]\s+/gm, '. ');
    text = text.replace(/^\d+\.\s+/gm, '. ');

    // 7. Expand academic subjects, syllabus acronyms and natural pronunciation
    text = text
      // Tyler's exact 6 IB subjects
      .replace(/\bDesign HL\b/gi, 'Design Technology Higher Level')
      .replace(/\bDesign SL\b/gi, 'Design Technology Standard Level')
      .replace(/\bGlobal Politics HL\b/gi, 'Global Politics Higher Level')
      .replace(/\bGloPol\b/gi, 'Global Politics')
      .replace(/\bMusic HL\b/gi, 'Music Higher Level')
      .replace(/\bGerman B SL\b/gi, 'German B Standard Level')
      .replace(/\bGerman B\b/gi, 'German B')
      .replace(/\bEnglish A SL\b/gi, 'English A Standard Level')
      .replace(/\bEnglish A\b/gi, 'English A')
      .replace(/\bMath AI SL\b/gi, 'Math A I Standard Level')
      .replace(/\bMath AI\b/gi, 'Math A I')
      .replace(/\bMaths AI\b/gi, 'Maths A I')
      .replace(/\bMathematics AI\b/gi, 'Mathematics A I')
      .replace(/\bHL\b/g, 'Higher Level')
      .replace(/\bSL\b/g, 'Standard Level')
      .replace(/\bIB\b/g, 'I B')
      .replace(/\bIA\b/g, 'Internal Assessment')
      .replace(/\bEE\b/g, 'Extended Essay')
      .replace(/\bTOK\b/g, 'T O K')
      .replace(/\bCAS\b/g, 'C A S')
      .replace(/\bXP\b/g, 'X P')
      .replace(/\bmins\b/gi, 'minutes')
      .replace(/\bmin\b/gi, 'minute')
      .replace(/\bhrs\b/gi, 'hours')
      .replace(/\bhr\b/gi, 'hour')
      .replace(/\bsecs\b/gi, 'seconds')
      .replace(/\be\.g\.\b/gi, 'for example')
      .replace(/\bi\.e\.\b/gi, 'that is')
      .replace(/\bvs\.\b/gi, 'versus')
      .replace(/\bapprox\.\b/gi, 'approximately');

    // 8. Natural time formatting (e.g. 17:00 -> 5 PM, 09:30 -> 9:30 AM)
    text = text.replace(/\b(\d{1,2}):00\b/g, '$1 o\'clock');

    // 9. Format breath pauses (replace colons and semicolons with soft commas)
    text = text.replace(/[:;]/g, ', ');

    // 10. Clean leftover symbols, excessive dashes, and spaces
    text = text
      .replace(/[~^>|]/g, ' ')
      .replace(/-{2,}/g, ', ')
      .replace(/\s+/g, ' ')
      .replace(/\.+/g, '.')
      .replace(/,\s*,/g, ',')
      .replace(/\s+\./g, '.')
      .trim();

    return text;
  }

  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public startListening(callbacks: SpeechEngineCallbacks): boolean {
    if (!this.isRecognitionSupported()) {
      callbacks.onError?.('Speech recognition is not supported in this browser. You can type commands directly!');
      return false;
    }

    try {
      this.stopListening();

      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      this.recognition = new SpeechRecognitionConstructor();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          callbacks.onInterimResult?.(interim);
        }
        if (final) {
          callbacks.onFinalResult?.(final.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        console.warn('Speech recognition warning:', event.error);
        if (event.error === 'not-allowed') {
          callbacks.onError?.('Microphone access was denied. Please allow microphone permissions or type commands.');
        } else if (event.error !== 'no-speech') {
          callbacks.onError?.(`Voice capture error: ${event.error}`);
        }
        callbacks.onEnd?.();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        callbacks.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      callbacks.onError?.('Could not initiate microphone. You can type your command below.');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  /**
   * Speaks the given text with articulate pacing, crisp pronunciation,
   * and safeguards against browser speech cancellation/stalling bugs.
   */
  public speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      this.stopSpeaking();

      // Ensure voices are initialized
      if (!this.selectedVoice || !this.voicesLoaded) {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          this.selectedVoice = this.pickBestVoice(voices);
        }
      }

      const cleaned = this.cleanTextForSpeech(text);
      if (!cleaned) {
        onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleaned);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang = this.selectedVoice.lang || 'en-GB';
      }

      // 0.98 rate gives a dignified, deliberate British cadence where every word is clear
      utterance.rate = this.customRate;
      utterance.pitch = this.customPitch;
      utterance.volume = this.customVolume;

      utterance.onstart = () => {
        this.isSpeaking = true;
        // Fix for Chromium speech engine bug where speech cuts out after 14s
        if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            clearInterval(this.keepAliveTimer);
          } else {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);
      };

      utterance.onend = () => {
        if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
        this.isSpeaking = false;
        onEnd?.();
      };

      utterance.onerror = () => {
        if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
        this.isSpeaking = false;
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
      this.isSpeaking = false;
      onEnd?.();
    }
  }

  public testVoice(sampleText?: string) {
    const defaultSample =
      'Greetings, Tyler. All systems and calendar protocols are operating at peak efficiency. How may I assist your studies today?';
    this.speak(sampleText || defaultSample);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
    this.isSpeaking = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getSelectedVoiceName(): string {
    return this.selectedVoice?.name || 'Default English Voice';
  }
}

export const speechEngine = new SpeechEngine();
