// Gobble Run — all sound is synthesized with WebAudio at run time.
// One job: every gobble, thud and jingle, with no audio files to load.
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, dur, type, vol, when = 0, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  gobble() {
    // A panicked turkey gobble: three fast descending clucks.
    this.tone(520, 0.09, 'square', 0.12, 0, 380);
    this.tone(480, 0.09, 'square', 0.12, 0.1, 340);
    this.tone(430, 0.14, 'square', 0.14, 0.2, 280);
  }

  flap() {
    this.tone(300, 0.08, 'triangle', 0.1, 0, 520);
  }

  alarm() {
    // The farmer spotted you: two sharp warning blasts.
    this.tone(880, 0.12, 'sawtooth', 0.1, 0, 880);
    this.tone(880, 0.12, 'sawtooth', 0.1, 0.16, 660);
  }

  hurt() {
    this.tone(220, 0.25, 'sawtooth', 0.16, 0, 90);
  }

  pickup() {
    this.tone(660, 0.08, 'sine', 0.14, 0, 990);
    this.tone(990, 0.12, 'sine', 0.12, 0.07, 1320);
  }

  dash() {
    this.tone(180, 0.16, 'sine', 0.12, 0, 720);
  }

  hide() {
    this.tone(340, 0.2, 'triangle', 0.08, 0, 180);
  }

  win() {
    // A little escape jig: rising notes.
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.14, i * 0.13));
  }

  lose() {
    [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.22, 'sawtooth', 0.1, i * 0.16));
  }

  click() {
    this.tone(700, 0.05, 'square', 0.08);
  }
}
