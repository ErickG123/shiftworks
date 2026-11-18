import type { SimulationEvent } from '../domain/simulation.model';

export type SoundCue = Readonly<{ frequency: number; duration: number; waveform: OscillatorType }>;

export function soundCueForEvent(event: SimulationEvent): SoundCue | null {
  switch (event.kind) {
    case 'MODE_SHIFT_STARTED': return Object.freeze({ frequency: 260, duration: 0.11, waveform: 'triangle' });
    case 'PROCESS_STARTED': return Object.freeze({ frequency: 390, duration: 0.08, waveform: 'sine' });
    case 'PROCESS_COMPLETED': return Object.freeze({ frequency: 520, duration: 0.1, waveform: 'triangle' });
    case 'ROUTE_CHOSEN': return Object.freeze({ frequency: event.route === 'A' ? 340 : 300, duration: 0.07, waveform: 'sine' });
    case 'ITEM_DELIVERED': return Object.freeze({ frequency: 660, duration: 0.14, waveform: 'sine' });
    case 'ITEM_REJECTED': return Object.freeze({ frequency: 170, duration: 0.16, waveform: 'triangle' });
    default: return null;
  }
}

export class SoundEffects {
  private context: AudioContext | null = null;
  private enabled = false;
  private volume = 0.22;

  isEnabled(): boolean { return this.enabled; }
  getVolume(): number { return this.volume; }

  async setEnabled(enabled: boolean): Promise<boolean> {
    if (!enabled) { this.enabled = false; return true; }
    if (typeof window.AudioContext === 'undefined') return false;
    try {
      this.context ??= new window.AudioContext();
      await this.context.resume();
      this.enabled = this.context.state === 'running';
      return this.enabled;
    } catch {
      this.enabled = false;
      return false;
    }
  }

  setVolume(value: number): void {
    this.volume = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : this.volume;
  }

  play(cue: SoundCue | null): void {
    if (!this.enabled || !this.context || this.context.state !== 'running' || !cue || this.volume === 0) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = cue.waveform;
    oscillator.frequency.setValueAtTime(cue.frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(this.volume * 0.12, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + cue.duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + cue.duration + 0.01);
  }

  dispose(): void {
    this.enabled = false;
    const context = this.context;
    this.context = null;
    if (context && context.state !== 'closed') void context.close();
  }
}
