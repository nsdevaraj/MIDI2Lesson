// Lightweight Web Audio synthesizer for previewing lesson notes & rhythm

class LessonAudioPlayer {
  private ctx: AudioContext | null = null;
  private isPlayingState: boolean = false;
  private currentNoteIndex: number = -1;
  private timerIds: number[] = [];
  private onNoteCallback: ((index: number) => void) | null = null;
  private onFinishCallback: (() => void) | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public isPlaying(): boolean {
    return this.isPlayingState;
  }

  public getCurrentIndex(): number {
    return this.currentNoteIndex;
  }

  public setCallbacks(
    onNote: (index: number) => void,
    onFinish: () => void
  ): void {
    this.onNoteCallback = onNote;
    this.onFinishCallback = onFinish;
  }

  public playNoteOnce(pitch: number, durationSeconds: number = 0.3): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const freq = 440 * Math.pow(2, (pitch - 69) / 12);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.05, durationSeconds));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds + 0.05);
    } catch {
      // Audio playback fails gracefully if browser blocks before user gesture
    }
  }

  public playSequence(notes: number[], beats: number[], bpm: number): void {
    this.stop();
    if (notes.length === 0) return;

    this.isPlayingState = true;
    const ctx = this.getAudioContext();
    const secondsPerBeat = 60 / Math.max(40, Math.min(160, bpm));

    let accumulatedTime = 0;
    const totalNotes = notes.length;

    for (let i = 0; i < totalNotes; i++) {
      const pitch = notes[i];
      const beat = beats[i] || 1;
      const noteDelayMs = accumulatedTime * 1000;
      const noteDurationSec = Math.max(0.1, beat * secondsPerBeat * 0.88);

      const timerId = window.setTimeout(() => {
        if (!this.isPlayingState) return;
        this.currentNoteIndex = i;
        if (this.onNoteCallback) {
          this.onNoteCallback(i);
        }
        this.playNoteOnce(pitch, noteDurationSec);
      }, noteDelayMs);

      this.timerIds.push(timerId);
      accumulatedTime += beat * secondsPerBeat;
    }

    // Schedule finish
    const endTimer = window.setTimeout(() => {
      this.stop();
      if (this.onFinishCallback) {
        this.onFinishCallback();
      }
    }, accumulatedTime * 1000 + 100);

    this.timerIds.push(endTimer);
  }

  public stop(): void {
    this.isPlayingState = false;
    this.currentNoteIndex = -1;
    for (const id of this.timerIds) {
      window.clearTimeout(id);
    }
    this.timerIds = [];
  }
}

export const audioPlayer = new LessonAudioPlayer();
