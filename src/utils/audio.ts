// Web Audio API Synthesizer for satisfied physical sound effects without loading external files

export const playClinkSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Tone 1: High pitch glass clink (2200 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2200, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(2150, ctx.currentTime + 0.15);

    // Tone 2: Harmonious resonance (2750 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2750, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(2700, ctx.currentTime + 0.12);

    // Decay envelopes
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    gain2.gain.setValueAtTime(0.08, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);
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
