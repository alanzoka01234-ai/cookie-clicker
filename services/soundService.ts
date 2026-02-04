
const CLICK_FILES = [
  '/click_01.mp3',
  '/click_02.mp3',
  '/click_03.mp3',
  '/click_04.mp3',
  '/click_05.mp3',
  '/click_06.mp3',
  '/click_07.mp3'
];

class SoundService {
  private context: AudioContext | null = null;
  private buffers: AudioBuffer[] = [];
  private enabled: boolean = true;
  private volume: number = 0.5;
  private currentBufferIndex: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Load Settings
      try {
        const saved = localStorage.getItem('biscoito_sound_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.enabled = parsed.enabled ?? true;
          this.volume = parsed.volume ?? 0.5;
        }
      } catch (e) {
        console.error('Failed to load sound settings', e);
      }

      // 2. Preload Audio immediately (don't wait for first click)
      this.initAudio();
    }
  }

  private initAudio() {
    try {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtor) {
        this.context = new AudioCtor();
        this.loadBuffers();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  public unlockAudio() {
    // Resume context on user interaction (Mobile autoplay policy)
    if (this.context && this.context.state === 'suspended') {
      this.context.resume().catch(e => console.error("Audio resume failed", e));
    }
  }

  private async loadBuffers() {
    if (!this.context) return;

    const promises = CLICK_FILES.map(async (path) => {
      try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        // Use Promise wrapper for legacy Safari callback support if needed, 
        // though most modern browsers support promise-based decodeAudioData.
        return await this.context!.decodeAudioData(arrayBuffer);
      } catch (e) {
        console.warn(`Failed to load sound: ${path}`, e);
        return null;
      }
    });

    const results = await Promise.all(promises);
    this.buffers = results.filter((b): b is AudioBuffer => b !== null);
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    this.persist();
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    this.persist();
  }

  public getEnabled() {
    return this.enabled;
  }

  public getVolume() {
    return this.volume;
  }

  private persist() {
    localStorage.setItem('biscoito_sound_settings', JSON.stringify({
      enabled: this.enabled,
      volume: this.volume
    }));
  }

  public playClick() {
    if (!this.enabled || !this.context) return;
    if (this.buffers.length === 0) return;

    try {
      const source = this.context.createBufferSource();
      const buffer = this.buffers[this.currentBufferIndex];
      source.buffer = buffer;

      const gainNode = this.context.createGain();
      gainNode.gain.value = this.volume;

      source.connect(gainNode);
      gainNode.connect(this.context.destination);

      source.start(0);

      // Cycle through sounds sequentially
      this.currentBufferIndex = (this.currentBufferIndex + 1) % this.buffers.length;
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }
}

export const soundService = new SoundService();
