// Every sound on the site is synthesized live with the Web Audio API — no audio files to download or license.

type Voice = { osc: OscillatorNode; gain: GainNode };

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private fx: GainNode | null = null;
  private ambient: GainNode | null = null;
  private ambientNodes: AudioScheduledSourceNode[] = [];
  private noise: AudioBuffer | null = null;
  private charge: Voice | null = null;
  private lastHover = 0;
  enabled = true;

  /** Must be called from a user gesture (the Enter button) so browsers allow audio. */
  init() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? 1 : 0;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    this.master.connect(comp).connect(this.ctx.destination);

    this.fx = this.ctx.createGain();
    this.fx.gain.value = 0.9;
    this.fx.connect(this.master);

    this.ambient = this.ctx.createGain();
    this.ambient.gain.value = 0;
    this.ambient.connect(this.master);

    const len = this.ctx.sampleRate * 2;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 1 : 0, t, 0.15);
  }

  private get ready() {
    return !!(this.ctx && this.fx && this.enabled);
  }

  private tone(freq: number, dur: number, opts: { type?: OscillatorType; gain?: number; to?: number; delay?: number } = {}) {
    if (!this.ready) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(freq, t);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.08, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.fx!);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private sweep(from: number, to: number, dur: number, gain = 0.12, q = 6, delay = 0) {
    if (!this.ready || !this.noise) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = q;
    bp.frequency.setValueAtTime(from, t);
    bp.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(this.fx!);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  hover() {
    const now = performance.now();
    if (now - this.lastHover < 60) return;
    this.lastHover = now;
    const base = 1900 + Math.random() * 300;
    this.tone(base, 0.05, { type: "triangle", gain: 0.035, to: base * 1.25 });
  }

  click() {
    this.tone(660, 0.09, { type: "square", gain: 0.03 });
    this.tone(1320, 0.12, { type: "sine", gain: 0.06, delay: 0.05 });
  }

  whoosh() {
    this.sweep(300, 3200, 0.6, 0.14, 3);
  }

  menu(open: boolean) {
    if (open) {
      this.sweep(500, 4000, 0.4, 0.08, 4);
      [523, 784, 1046].forEach((f, i) => this.tone(f, 0.18, { type: "triangle", gain: 0.04, delay: i * 0.05 }));
    } else {
      this.sweep(3500, 400, 0.35, 0.07, 4);
    }
  }

  /** The "power on" cue played when entering the world. */
  intro() {
    if (!this.ready) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(200, t);
    lp.frequency.exponentialRampToValueAtTime(5000, t + 1.4);
    lp.frequency.exponentialRampToValueAtTime(600, t + 3.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
    lp.connect(g).connect(this.fx!);
    [110, 164.8, 220, 329.6].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f * 0.5, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 1.2);
      o.detune.value = (i - 1.5) * 7;
      o.connect(lp);
      o.start(t);
      o.stop(t + 3.5);
    });
    this.sweep(200, 6000, 1.6, 0.1, 2);
    [1318, 1568, 1976, 2637].forEach((f, i) => this.tone(f, 0.5, { gain: 0.03, delay: 1.1 + i * 0.09 }));
  }

  /** Rising tone while a HOLD button is pressed. */
  chargeStart() {
    if (!this.ready) return;
    this.chargeStop();
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 1);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.1);
    osc.connect(lp).connect(g).connect(this.fx!);
    osc.start(t);
    this.charge = { osc, gain: g };
  }

  chargeStop() {
    if (!this.charge || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.charge.gain.gain.cancelScheduledValues(t);
    this.charge.gain.gain.setTargetAtTime(0.0001, t, 0.04);
    this.charge.osc.stop(t + 0.2);
    this.charge = null;
  }

  granted() {
    this.chargeStop();
    [880, 1108, 1318, 1760].forEach((f, i) => this.tone(f, 0.22, { type: "triangle", gain: 0.05, delay: i * 0.06 }));
    this.sweep(800, 5000, 0.5, 0.08, 3, 0.1);
  }

  type() {
    this.tone(2400 + Math.random() * 800, 0.02, { type: "square", gain: 0.012 });
  }

  /** Low drifting drone that plays under the whole experience. */
  startAmbient() {
    if (!this.ctx || !this.ambient || this.ambientNodes.length) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 380;
    lp.Q.value = 2;
    lp.connect(this.ambient);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start(t);
    this.ambientNodes.push(lfo);

    [55, 55.3, 82.4, 110.2].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i < 2 ? "sawtooth" : "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i < 2 ? 0.18 : 0.12;
      o.connect(g).connect(lp);
      o.start(t);
      this.ambientNodes.push(o);
    });

    if (this.noise) {
      const n = ctx.createBufferSource();
      n.buffer = this.noise;
      n.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 900;
      bp.Q.value = 0.6;
      const g = ctx.createGain();
      g.gain.value = 0.02;
      n.connect(bp).connect(g).connect(this.ambient);
      n.start(t);
      this.ambientNodes.push(n);
    }
    this.ambient.gain.setTargetAtTime(0.16, t, 2.5);
  }
}

export const sound = new SoundEngine();
