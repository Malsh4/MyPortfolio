// Every sound on the site is synthesized live with the Web Audio API — no audio files to download or license.
// The palette is deliberately soft: sine/triangle voices tuned to one key (A minor pentatonic), short envelopes,
// and a shared room reverb, so cues feel like part of one calm interface rather than separate beeps.

type Voice = { osc: OscillatorNode; gain: GainNode };

// A minor pentatonic, used for every melodic cue so they always sit together.
const NOTE = { A3: 220, C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5 };
const SCALE = [NOTE.A4, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6];

// Speech: female English voices, best first. Male voices are never used; with none available, nothing is spoken.
const FEMALE_VOICES = [
  "Microsoft Aria",
  "Microsoft Jenny",
  "Microsoft Libby",
  "Microsoft Sonia",
  "Microsoft Emma",
  "Microsoft Ava",
  "Google UK English Female",
  "Google US English",
  "Samantha",
  "Ava",
  "Allison",
  "Karen",
  "Moira",
  "Tessa",
  "Serena",
  "Victoria",
  "Fiona",
  "Microsoft Zira",
  "Microsoft Hazel",
  "Microsoft Susan",
  "Female",
];
const MALE_HINTS = ["David", "Mark", "Guy", "Ryan", "Daniel", "Alex", "Fred", "George", "James", "Richard", "Thomas", "Andrew", "Brian", "Christopher", "Eric", "Roger", "Steffan", "Male", "UK English Male"];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private fx: GainNode | null = null;
  private wet: GainNode | null = null;
  private ambient: GainNode | null = null;
  private ambientNodes: AudioScheduledSourceNode[] = [];
  private noise: AudioBuffer | null = null;
  private charge: Voice | null = null;
  private lastHover = 0;
  private voice: SpeechSynthesisVoice | null = null;
  enabled = true;

  /** Must be called from a user gesture (the Enter button) so browsers allow audio. */
  init() {
    this.loadVoice();
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.enabled ? 0.9 : 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 12;
    comp.ratio.value = 3;
    comp.attack.value = 0.01;
    comp.release.value = 0.25;
    this.master.connect(comp).connect(ctx.destination);

    // dry bus + a soft room reverb that every cue feeds a little of
    this.fx = ctx.createGain();
    this.fx.gain.value = 0.85;
    this.fx.connect(this.master);
    const verb = ctx.createConvolver();
    verb.buffer = this.impulse(2.4, 3);
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.32;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 180;
    this.fx.connect(hp).connect(verb).connect(this.wet).connect(this.master);

    this.ambient = ctx.createGain();
    this.ambient.gain.value = 0;
    this.ambient.connect(this.master);

    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  /** Stereo decaying noise as a reverb impulse response. */
  private impulse(seconds: number, decay: number) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on && typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 0.9 : 0, t, 0.15);
  }

  private get ready() {
    return !!(this.ctx && this.fx && this.enabled);
  }

  /** A single enveloped voice. `attack`/`release` in seconds; `to` glides the pitch. */
  private tone(
    freq: number,
    dur: number,
    opts: { type?: OscillatorType; gain?: number; to?: number; delay?: number; attack?: number; detune?: number; filter?: number } = {},
  ) {
    if (!this.ready) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(freq, t);
    if (opts.detune) osc.detune.value = opts.detune;
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
    const attack = opts.attack ?? 0.006;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.05, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, attack + 0.02));
    let out: AudioNode = osc;
    if (opts.filter) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = opts.filter;
      osc.connect(lp);
      out = lp;
    }
    out.connect(g).connect(this.fx!);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  /** Filtered noise: breaths of air, whooshes, hisses. */
  private air(
    from: number,
    to: number,
    dur: number,
    opts: { gain?: number; q?: number; delay?: number; type?: BiquadFilterType; attack?: number } = {},
  ) {
    if (!this.ready || !this.noise) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime + (opts.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = opts.type ?? "bandpass";
    f.Q.value = opts.q ?? 1.2;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    const peak = opts.gain ?? 0.05;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + dur * (opts.attack ?? 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.fx!);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  /** A soft bell: fundamental plus a quiet octave-and-a-fifth partial. */
  private bell(freq: number, dur: number, gain: number, delay = 0) {
    this.tone(freq, dur, { gain, delay, attack: 0.004 });
    this.tone(freq * 3, dur * 0.5, { gain: gain * 0.18, delay, attack: 0.003 });
  }

  // ---- interface -------------------------------------------------------------------------------------------------

  hover() {
    const now = performance.now();
    if (now - this.lastHover < 70) return;
    this.lastHover = now;
    this.tone(NOTE.E6 + Math.random() * 20, 0.07, { gain: 0.014, attack: 0.004 });
  }

  click() {
    this.tone(NOTE.A5, 0.08, { gain: 0.04, attack: 0.002 });
    this.tone(NOTE.E6, 0.12, { gain: 0.022, delay: 0.035 });
  }

  whoosh() {
    this.air(300, 2400, 0.55, { gain: 0.05, q: 0.8 });
  }

  menu(open: boolean) {
    if (open) {
      this.air(400, 2200, 0.35, { gain: 0.035, q: 0.9 });
      [NOTE.A4, NOTE.E5, NOTE.A5].forEach((f, i) => this.bell(f, 0.5, 0.03, i * 0.05));
    } else {
      this.air(2200, 400, 0.3, { gain: 0.03, q: 0.9 });
      this.tone(NOTE.E5, 0.25, { gain: 0.025, to: NOTE.A4 });
    }
  }

  /** The "power on" cue played when entering the world: a warm swell resolving on a soft chord. */
  intro() {
    if (!this.ready) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(300, t);
    lp.frequency.exponentialRampToValueAtTime(2200, t + 1.6);
    lp.frequency.exponentialRampToValueAtTime(900, t + 3.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
    lp.connect(g).connect(this.fx!);
    [NOTE.A3, NOTE.E4, NOTE.A4, NOTE.C5].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 4;
      o.connect(lp);
      o.start(t);
      o.stop(t + 3.7);
    });
    this.air(200, 3000, 1.8, { gain: 0.03, q: 0.7 });
    [NOTE.E5, NOTE.A5, NOTE.C6, NOTE.E6].forEach((f, i) => this.bell(f, 0.9, 0.018, 1.2 + i * 0.1));
  }

  /** Rising tone while a HOLD button is pressed. */
  chargeStart() {
    if (!this.ready) return;
    this.chargeStop();
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(NOTE.A3, t);
    osc.frequency.exponentialRampToValueAtTime(NOTE.A5, t + 1);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1600;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.03, t + 0.12);
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
    [NOTE.A5, NOTE.C6, NOTE.E6].forEach((f, i) => this.bell(f, 0.5, 0.03, i * 0.06));
    this.air(800, 4000, 0.45, { gain: 0.025, q: 1 });
  }

  type() {
    this.air(3000, 2600, 0.03, { gain: 0.02, q: 3, attack: 0.1 });
  }

  // ---- loading ---------------------------------------------------------------------------------------------------

  /**
   * Browsers only allow audio after the visitor has clicked or pressed a key. The preloader calls this on its first
   * such gesture, so its loading ticks can be heard before the Enter button.
   */
  unlock() {
    this.init();
  }

  /** A soft tick as the loading bar advances, stepping up the scale. */
  loadTick(progress: number) {
    const f = SCALE[Math.min(SCALE.length - 1, Math.floor((progress / 100) * SCALE.length))];
    this.tone(f, 0.12, { gain: 0.018, attack: 0.003 });
  }

  /** Loading finished: a short, bright resolve. */
  loadReady() {
    [NOTE.A4, NOTE.E5, NOTE.A5].forEach((f, i) => this.bell(f, 1.1, 0.03, i * 0.09));
  }

  // ---- the room --------------------------------------------------------------------------------------------------

  /**
   * A wooden door: a short hinge creak (stick-slip friction, rendered as a train of tiny clicks through the
   * resonances of a wooden panel), then a solid, muffled wooden thump and the latch.
   */
  door(open: boolean) {
    if (!this.ready) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;

    // hinge creak
    const dur = open ? 0.75 : 0.55;
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, Math.floor(sr * dur), sr);
    const d = buf.getChannelData(0);
    let pos = 0;
    let phase = 0;
    while (pos < d.length) {
      const p = pos / d.length;
      // click rate sweeps like a hinge turning: slow, faster, then slow again
      const rate = 38 + 70 * Math.sin(Math.PI * p) + 12 * Math.sin(phase);
      phase += 0.7 + Math.random() * 0.6;
      const amp = Math.sin(Math.PI * p) * (0.55 + Math.random() * 0.45);
      for (let k = 0; k < 40 && pos + k < d.length; k++) d[pos + k] += amp * Math.exp(-k / 6) * (k % 2 ? -1 : 1);
      pos += Math.max(20, Math.floor(sr / rate));
    }
    const creak = ctx.createBufferSource();
    creak.buffer = buf;
    creak.playbackRate.value = open ? 1 : 1.12;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    // wood-panel resonances
    [
      [620, 7],
      [1180, 9],
      [2150, 10],
    ].forEach(([f, q]) => {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = f;
      bp.Q.value = q;
      creak.connect(bp).connect(g);
    });
    g.connect(this.fx!);
    creak.start(t);
    creak.stop(t + dur + 0.05);

    // wooden thump as it comes to rest, and the latch
    const at = open ? 0.62 : 0.45;
    this.tone(118, 0.28, { gain: 0.11, to: 72, delay: at, attack: 0.003, filter: 420 });
    this.air(700, 300, 0.12, { gain: 0.05, q: 1.2, type: "lowpass", delay: at, attack: 0.05 });
    this.tone(260, 0.12, { type: "triangle", gain: 0.02, delay: at, attack: 0.002, filter: 900 });
    if (!open) this.air(3600, 3200, 0.025, { gain: 0.03, q: 5, delay: at + 0.08, attack: 0.1 });
  }

  /** A neon tube flickering on: a short, quiet electrical hum with a faint crackle. */
  neonBuzz() {
    if (!this.ready) return;
    this.tone(100, 0.1, { type: "triangle", gain: 0.022, filter: 900 });
    this.tone(200, 0.08, { gain: 0.012 });
    this.air(5000, 6000, 0.05, { gain: 0.012, q: 6, attack: 0.1 });
  }

  /** Arriving in About as the room settles into a dimmer mood: a slow, warm swell that resolves softly. */
  settle() {
    [NOTE.A3, NOTE.E4, NOTE.C5].forEach((f, i) =>
      this.tone(f, 2.2, { type: "sine", gain: 0.022 - i * 0.004, attack: 0.7, delay: i * 0.08, filter: 1400 }),
    );
    this.bell(NOTE.E5, 1.6, 0.012, 0.5);
    this.air(900, 500, 1.4, { gain: 0.012, q: 0.6, type: "lowpass", attack: 0.5 });
  }

  /** Arriving at a section: a soft single note, a step higher for each section down the page. */
  sectionChange(index: number) {
    const f = SCALE[index % SCALE.length];
    this.bell(f, 0.9, 0.018);
    this.air(600, 1400, 0.4, { gain: 0.012, q: 0.8 });
  }

  /** The portal (neon box) opening: a rising breath and an open fifth. */
  portal() {
    this.air(200, 3200, 1.3, { gain: 0.045, q: 0.8 });
    [NOTE.A3, NOTE.E4, NOTE.A4].forEach((f, i) => this.tone(f, 1.6, { type: "triangle", gain: 0.02, delay: 0.2 + i * 0.1, attack: 0.25, filter: 1500 }));
  }

  /** The hologram building up over `seconds`: a slow swell with a rising shimmer, resolving as she completes. */
  materialize(seconds: number) {
    if (!this.ready) return;
    [NOTE.A3, NOTE.C4, NOTE.E4].forEach((f) => this.tone(f, seconds, { type: "triangle", gain: 0.016, attack: seconds * 0.6, filter: 1200 }));
    this.air(500, 5000, seconds, { gain: 0.022, q: 2.5, attack: 0.8 });
    const steps = Math.round(seconds / 0.16);
    for (let i = 0; i < steps; i++) {
      const f = SCALE[i % SCALE.length] * (i >= SCALE.length ? 2 : 1);
      this.tone(f, 0.25, { gain: 0.01 + (i / steps) * 0.012, delay: i * 0.16, attack: 0.004 });
    }
    [NOTE.A4, NOTE.C5, NOTE.E5, NOTE.A5].forEach((f, i) => this.bell(f, 1.4, 0.026, seconds + i * 0.06));
  }

  /** Hovering a card: a gentle two-note lift. */
  cardHover() {
    const now = performance.now();
    if (now - this.lastHover < 90) return;
    this.lastHover = now;
    this.tone(NOTE.E5, 0.14, { gain: 0.02, attack: 0.004 });
    this.tone(NOTE.A5, 0.18, { gain: 0.016, delay: 0.06, attack: 0.004 });
  }

  /** Warm, quiet pad that sits under the whole experience. */
  startAmbient() {
    if (!this.ctx || !this.ambient || this.ambientNodes.length) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    lp.Q.value = 0.7;
    lp.connect(this.ambient);

    // a slow filter drift keeps it alive without drawing attention
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start(t);
    this.ambientNodes.push(lfo);

    [NOTE.A3 / 2, NOTE.E4 / 2, NOTE.A3, NOTE.C4].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i < 2 ? "sine" : "triangle";
      o.frequency.value = f;
      o.detune.value = (i % 2 ? 1 : -1) * 3;
      const g = ctx.createGain();
      g.gain.value = i < 2 ? 0.22 : 0.07;
      o.connect(g).connect(lp);
      o.start(t);
      this.ambientNodes.push(o);
    });
    this.ambient.gain.setTargetAtTime(0.018, t, 3);
  }

  // ---- voice -----------------------------------------------------------------------------------------------------

  /** Find a female English voice. The list loads asynchronously in some browsers, so re-check when it changes. */
  private loadVoice() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pick = () => {
      const all = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
      if (!all.length) return;
      const byName = FEMALE_VOICES.map((n) => all.find((v) => v.name.includes(n))).find(Boolean);
      const notMale = all.filter((v) => !MALE_HINTS.some((m) => v.name.includes(m)));
      // prefer a known female voice; otherwise a voice not known to be male, but only if it names itself female
      this.voice = byName ?? notMale.find((v) => /female|woman/i.test(v.name)) ?? null;
    };
    pick();
    window.speechSynthesis.addEventListener?.("voiceschanged", pick);
  }

  /** Speak a short phrase in a female English voice (only when sound is on; silent if no female voice exists). */
  say(text: string, opts: { rate?: number; pitch?: number } = {}) {
    if (!this.ready || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!this.voice) this.loadVoice();
    if (!this.voice) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = this.voice;
    u.lang = this.voice.lang;
    u.rate = opts.rate ?? 0.98;
    u.pitch = opts.pitch ?? 1.05;
    u.volume = 0.85;
    synth.speak(u);
  }
}

export const sound = new SoundEngine();
