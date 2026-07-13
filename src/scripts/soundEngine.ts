// ───────────────────────── Áudio sintetizado (Web Audio API, sem arquivos externos) ─────────────────────────
// Toda a trilha e os efeitos sonoros do jogo são gerados por código (osciladores + ruído
// filtrado), sem depender de arquivos .mp3/.wav. Ver README do handoff de design para a
// especificação completa de cada função.

type OscType = OscillatorType;

const CHORDS: Record<string, { bass: number; lead: number[]; seventh: number }> = {
  Em7: { bass: 82.41, lead: [329.63, 392.0, 440.0], seventh: 293.66 },
  Cmaj7: { bass: 65.41, lead: [261.63, 329.63, 392.0], seventh: 246.94 },
  Gmaj7: { bass: 98.0, lead: [392.0, 440.0, 493.88], seventh: 369.99 },
  D7: { bass: 73.42, lead: [293.66, 349.23, 392.0], seventh: 261.63 },
  Am7: { bass: 110.0, lead: [220.0, 261.63, 329.63], seventh: 196.0 },
};
const SONG_FORM: { type: string; bars: number; prog: string[] }[] = [
  { type: 'intro', bars: 4, prog: ['Em7', 'Cmaj7', 'Gmaj7', 'D7'] },
  { type: 'verse', bars: 8, prog: ['Em7', 'Cmaj7', 'Gmaj7', 'D7'] },
  { type: 'chorus', bars: 8, prog: ['Gmaj7', 'D7', 'Em7', 'Cmaj7'] },
  { type: 'verse', bars: 8, prog: ['Em7', 'Cmaj7', 'Gmaj7', 'D7'] },
  { type: 'bridge', bars: 4, prog: ['Am7', 'Am7', 'Cmaj7', 'D7'] },
  { type: 'chorus', bars: 8, prog: ['Gmaj7', 'D7', 'Em7', 'Cmaj7'] },
];
const FORM_TOTAL = SONG_FORM.reduce((sum, s) => sum + s.bars, 0);
function getSection(barIdx: number) {
  let b = barIdx % FORM_TOTAL;
  for (const sec of SONG_FORM) {
    if (b < sec.bars) return { sec, barInSection: b };
    b -= sec.bars;
  }
  return { sec: SONG_FORM[0], barInSection: 0 };
}
const BOSS_RIFF = [82.41, 82.41, 87.31, 82.41, 98.0, 82.41, 77.78, 73.42];
const BOSS_DRONE = [82.41, 123.47, 174.61];

class SoundEngineImpl {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  muted = false;
  normalGain: GainNode | null = null;
  bossGain: GainNode | null = null;
  crackleSrc: AudioBufferSourceNode | null = null;
  musicTimer: number | null = null;
  musicMode: 'normal' | 'boss' = 'normal';
  private noiseBuf: AudioBuffer | null = null;
  private step = 0;
  private bar = 0;
  private readonly stepDur = 0.205;

  ensureCtx(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.02);
  }

  private tone(freq: number, start: number, dur: number, type: OscType, peak: number, destGain?: GainNode) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(destGain || this.master!);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuf) return this.noiseBuf;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
    return buf;
  }

  playHit() {
    this.ensureCtx();
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 1400;
    filt.Q.value = 0.9;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.26, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    src.connect(filt);
    filt.connect(nGain);
    nGain.connect(this.master!);
    src.start(t);
    src.stop(t + 0.09);

    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.14);
    oGain.gain.setValueAtTime(0.26, t);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(oGain);
    oGain.connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playItem() {
    this.ensureCtx();
    const t = this.ctx!.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, t + i * 0.055, 0.16, 'triangle', 0.09));
  }

  playClick() {
    this.ensureCtx();
    const t = this.ctx!.currentTime;
    this.tone(660, t, 0.06, 'square', 0.05);
    this.tone(880, t + 0.02, 0.05, 'triangle', 0.035);
  }

  private drumHit(kind: 'kick' | 'softkick' | 'rim' | 'hihat' | 'softhat' | 'snare', start: number, destGain: GainNode, velocity?: number) {
    const ctx = this.ctx!;
    const v = velocity == null ? 1 : velocity;
    if (kind === 'kick' || kind === 'softkick') {
      const soft = kind === 'softkick';
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(soft ? 95 : 120, start);
      osc.frequency.exponentialRampToValueAtTime(soft ? 42 : 40, start + (soft ? 0.16 : 0.12));
      gain.gain.setValueAtTime((soft ? 0.34 : 0.55) * v, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + (soft ? 0.22 : 0.16));
      osc.connect(gain);
      gain.connect(destGain);
      osc.start(start);
      osc.stop(start + 0.24);
    } else if (kind === 'rim') {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoiseBuffer(ctx);
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.value = 1100;
      filt.Q.value = 4;
      gain.gain.setValueAtTime(0.14 * v, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(destGain);
      src.start(start);
      src.stop(start + 0.07);
    } else {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoiseBuffer(ctx);
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      const soft = kind === 'softhat';
      filt.type = kind === 'hihat' || soft ? 'highpass' : 'bandpass';
      filt.frequency.value = soft ? 4500 : kind === 'hihat' ? 7000 : 1800;
      const peak = (soft ? 0.045 : kind === 'hihat' ? 0.09 : 0.28) * v;
      const dur = soft ? 0.03 : kind === 'hihat' ? 0.045 : 0.13;
      gain.gain.setValueAtTime(peak, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(destGain);
      src.start(start);
      src.stop(start + dur + 0.02);
    }
  }

  private pad(freqs: number[], start: number, dur: number, destGain: GainNode, peak: number) {
    const ctx = this.ctx!;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 420;
    filt.Q.value = 0.5;
    filt.connect(destGain);
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, start);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(peak / freqs.length, start + dur * 0.35);
      g.gain.linearRampToValueAtTime(0, start + dur);
      osc.connect(g);
      g.connect(filt);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  }

  private startCrackle() {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.002 ? 1.2 : 0.08);
    }
    src.buffer = buf;
    src.loop = true;
    const filt = ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = 2800;
    const gain = ctx.createGain();
    gain.gain.value = 0.006;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(this.master!);
    src.start();
    this.crackleSrc = src;
  }

  startMusic() {
    this.ensureCtx();
    this.musicMode = 'normal';
    if (this.musicTimer) return;
    const normalGain = this.ctx!.createGain();
    normalGain.gain.value = 0.15;
    normalGain.connect(this.master!);
    const bossGain = this.ctx!.createGain();
    bossGain.gain.value = 0.0001;
    bossGain.connect(this.master!);
    this.normalGain = normalGain;
    this.bossGain = bossGain;
    this.startCrackle();

    this.step = 0;
    this.bar = 0;
    const scheduleStep = () => {
      const ctx = this.ctx!;
      const swing = this.step % 2 === 1 ? 0.018 : 0;
      const t = ctx.currentTime + 0.02 + swing;
      const beat = this.step % 16;
      const nAmt = this.musicMode === 'boss' ? 0 : 1;
      const bAmt = 1 - nAmt;

      if (nAmt > 0 || this.normalGain!.gain.value > 0.005) {
        const { sec, barInSection } = getSection(this.bar);
        const chord = CHORDS[sec.prog[barInSection % sec.prog.length]];
        const isIntro = sec.type === 'intro';
        const isChorus = sec.type === 'chorus';
        const isBridge = sec.type === 'bridge';

        if (!isIntro && !isBridge) {
          if (beat === 0 || beat === 8) this.drumHit('softkick', t, this.normalGain!);
          if (beat === 6 || beat === 14) this.drumHit('rim', t, this.normalGain!);
        } else if (isIntro && (beat === 0 || beat === 8)) {
          this.drumHit('softkick', t, this.normalGain!);
        }
        if (!isBridge) {
          if (beat % 2 === 0) this.drumHit('softhat', t, this.normalGain!, isChorus ? 0.9 : 0.7);
          else if (isChorus || beat % 4 === 3) this.drumHit('softhat', t, this.normalGain!, 0.35);
        }

        if (beat % 8 === 0) this.tone(chord.bass, t, this.stepDur * 5.5, 'sine', isIntro ? 0.24 : 0.34, this.normalGain!);
        else if (beat % 8 === 4 && !isBridge) this.tone(chord.bass * 1.5, t, this.stepDur * 2.2, 'sine', 0.16, this.normalGain!);

        if (!isIntro) {
          if (isBridge) {
            if (beat === 0) this.pad([chord.bass, chord.seventh, chord.lead[0]], t, this.stepDur * 16, this.normalGain!, 0.26);
          } else {
            const density = isChorus ? [0, 2, 4, 7, 10, 12, 14] : [0, 4, 6, 10, 12];
            if (density.includes(beat)) {
              const note = chord.lead[Math.floor((beat / 2) % chord.lead.length)];
              this.tone(note, t, this.stepDur * 2.3, 'triangle', isChorus ? 0.15 : 0.1, this.normalGain!);
              if (isChorus && beat === 0) this.tone(chord.seventh, t, this.stepDur * 3, 'sine', 0.09, this.normalGain!);
            }
          }
        }
      }

      if (bAmt > 0 || this.bossGain!.gain.value > 0.005) {
        if (beat === 0 || beat === 6 || beat === 8 || beat === 12) this.drumHit('softkick', t, this.bossGain!, 1.1);
        if (beat === 4 || beat === 10) this.drumHit('rim', t, this.bossGain!);
        if (beat % 2 === 0) this.drumHit('softhat', t, this.bossGain!, 0.7);
        const riffNote = BOSS_RIFF[this.step % BOSS_RIFF.length];
        this.tone(riffNote, t, this.stepDur * 1.6, 'sine', beat % 4 === 0 ? 0.3 : 0.18, this.bossGain!);
        if (beat === 0) this.pad(BOSS_DRONE, t, this.stepDur * 16, this.bossGain!, 0.2);
        if (this.bar % 4 === 3 && beat === 14) this.tone(77.78, t, this.stepDur * 2, 'triangle', 0.22, this.bossGain!);
      }

      this.step++;
      if (this.step % 16 === 0) this.bar++;
    };
    scheduleStep();
    this.musicTimer = window.setInterval(scheduleStep, this.stepDur * 1000);
  }

  setBattleMode(isBoss: boolean, instant?: boolean) {
    const target: 'normal' | 'boss' = isBoss ? 'boss' : 'normal';
    if (!this.musicTimer) {
      this.musicMode = target;
      return;
    }
    this.musicMode = target;
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const rampTime = instant ? 0.05 : 1.4;
    if (this.normalGain) {
      this.normalGain.gain.cancelScheduledValues(now);
      this.normalGain.gain.setTargetAtTime(target === 'boss' ? 0.0001 : 0.15, now, rampTime / 4);
    }
    if (this.bossGain) {
      this.bossGain.gain.cancelScheduledValues(now);
      this.bossGain.gain.setTargetAtTime(target === 'boss' ? 0.15 : 0.0001, now, rampTime / 4);
    }
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.normalGain) {
      this.normalGain.disconnect();
      this.normalGain = null;
    }
    if (this.bossGain) {
      this.bossGain.disconnect();
      this.bossGain = null;
    }
    if (this.crackleSrc) {
      try {
        this.crackleSrc.stop();
      } catch {
        /* já parado */
      }
      this.crackleSrc = null;
    }
  }

  playGameOver(isBossLoss: boolean) {
    this.ensureCtx();
    const t = this.ctx!.currentTime;
    const gain = this.ctx!.createGain();
    gain.gain.value = 1;
    gain.connect(this.master!);
    if (isBossLoss) {
      [392, 349.23, 293.66, 220, 164.81].forEach((f, i) => this.tone(f, t + i * 0.11, 0.3, 'sawtooth', 0.15, gain));
      this.drumHit('kick', t + 0.5, gain);
      this.drumHit('kick', t + 0.66, gain);
    } else {
      [330, 277.18, 220, 174.61].forEach((f, i) => this.tone(f, t + i * 0.13, 0.28, 'triangle', 0.13, gain));
      this.drumHit('snare', t + 0.42, gain);
    }
  }
}

export const SoundEngine = new SoundEngineImpl();
