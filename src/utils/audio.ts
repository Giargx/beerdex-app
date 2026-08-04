// Web Audio API Synthesizer for satisfied physical sound effects without loading external files

export const playClinkSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // 1. Transient Impact Click (High frequency noise burst for crisp glass contact)
    const bufferSize = Math.floor(ctx.sampleRate * 0.015);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200, now);
    noiseFilter.Q.setValueAtTime(4, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 2. Heavy Glass Mug Body Thunk (~840 Hz low frequency mass resonance)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(840, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

    bodyGain.gain.setValueAtTime(0.22, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.18);

    // 3. Detuned Dual Glass Ring Harmonics (Creates realistic 80Hz acoustic beating)
    // Primary Glass 1: 2150 Hz
    const glass1 = ctx.createOscillator();
    const glass1Gain = ctx.createGain();
    glass1.type = 'sine';
    glass1.frequency.setValueAtTime(2150, now);
    glass1.frequency.exponentialRampToValueAtTime(2140, now + 0.4);

    glass1Gain.gain.setValueAtTime(0.28, now);
    glass1Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    glass1.connect(glass1Gain);
    glass1Gain.connect(ctx.destination);
    glass1.start(now);
    glass1.stop(now + 0.45);

    // Primary Glass 2: 2230 Hz
    const glass2 = ctx.createOscillator();
    const glass2Gain = ctx.createGain();
    glass2.type = 'sine';
    glass2.frequency.setValueAtTime(2230, now);
    glass2.frequency.exponentialRampToValueAtTime(2218, now + 0.4);

    glass2Gain.gain.setValueAtTime(0.24, now);
    glass2Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    glass2.connect(glass2Gain);
    glass2Gain.connect(ctx.destination);
    glass2.start(now);
    glass2.stop(now + 0.42);

    // High Crystal Overtone 1: 4300 Hz
    const glassHigh1 = ctx.createOscillator();
    const glassHigh1Gain = ctx.createGain();
    glassHigh1.type = 'sine';
    glassHigh1.frequency.setValueAtTime(4300, now);

    glassHigh1Gain.gain.setValueAtTime(0.12, now);
    glassHigh1Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    glassHigh1.connect(glassHigh1Gain);
    glassHigh1Gain.connect(ctx.destination);
    glassHigh1.start(now);
    glassHigh1.stop(now + 0.28);

    // High Crystal Overtone 2: 6450 Hz
    const glassHigh2 = ctx.createOscillator();
    const glassHigh2Gain = ctx.createGain();
    glassHigh2.type = 'sine';
    glassHigh2.frequency.setValueAtTime(6450, now);

    glassHigh2Gain.gain.setValueAtTime(0.06, now);
    glassHigh2Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    glassHigh2.connect(glassHigh2Gain);
    glassHigh2Gain.connect(ctx.destination);
    glassHigh2.start(now);
    glassHigh2.stop(now + 0.18);
  } catch (e) {
    console.warn("Web Audio API warning:", e);
  }
};

export const playPopSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Pop: Low pressure pop sweep
    const osc = ctx.createOscillator();
    const gainOsc = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.06);

    gainOsc.gain.setValueAtTime(0.25, ctx.currentTime);
    gainOsc.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

    osc.connect(gainOsc);
    gainOsc.connect(ctx.destination);

    // Fizz: High pass noise burst
    const bufferSize = ctx.sampleRate * 0.35; // 0.35s
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(8500, ctx.currentTime + 0.25);

    const gainNoise = ctx.createGain();
    gainNoise.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNoise.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    noiseSource.connect(filter);
    filter.connect(gainNoise);
    gainNoise.connect(ctx.destination);

    osc.start();
    noiseSource.start();

    osc.stop(ctx.currentTime + 0.08);
    noiseSource.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.warn("Web Audio API warning:", e);
  }
};
