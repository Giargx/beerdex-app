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
    const now = ctx.currentTime;

    // 1. Opener Metal Contact Click (0.012s transient click)
    const clickBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.012), ctx.sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    for (let i = 0; i < clickBuffer.length; i++) {
      clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clickBuffer.length * 0.25));
    }
    const clickSource = ctx.createBufferSource();
    clickSource.buffer = clickBuffer;

    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(2800, now);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    clickSource.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickSource.start(now);

    // 2. Pressurized Air Pop Vacuum Drop (580 Hz -> 110 Hz pitch drop with deep resonance)
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(580, now + 0.008);
    popOsc.frequency.exponentialRampToValueAtTime(110, now + 0.075);

    popGain.gain.setValueAtTime(0.55, now + 0.008);
    popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

    popOsc.connect(popGain);
    popGain.connect(ctx.destination);
    popOsc.start(now + 0.008);
    popOsc.stop(now + 0.085);

    // 3. Crown Cap Metallic Ping in Air (3400 Hz -> 3200 Hz ringing cap)
    const capPing = ctx.createOscillator();
    const capGain = ctx.createGain();
    capPing.type = 'sine';
    capPing.frequency.setValueAtTime(3400, now + 0.02);
    capPing.frequency.exponentialRampToValueAtTime(3200, now + 0.25);

    capGain.gain.setValueAtTime(0.18, now + 0.02);
    capGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    capPing.connect(capGain);
    capGain.connect(ctx.destination);
    capPing.start(now + 0.02);
    capPing.stop(now + 0.25);

    // 4. Carbonated Effervescent Fizz Spray (High frequency noise sweep)
    const fizzLen = Math.floor(ctx.sampleRate * 0.45);
    const fizzBuffer = ctx.createBuffer(1, fizzLen, ctx.sampleRate);
    const fizzData = fizzBuffer.getChannelData(0);
    for (let i = 0; i < fizzLen; i++) {
      fizzData[i] = (Math.random() * 2 - 1);
    }
    const fizzSource = ctx.createBufferSource();
    fizzSource.buffer = fizzBuffer;

    const fizzFilter = ctx.createBiquadFilter();
    fizzFilter.type = 'highpass';
    fizzFilter.frequency.setValueAtTime(5500, now + 0.025);
    fizzFilter.frequency.exponentialRampToValueAtTime(9000, now + 0.45);

    const fizzGain = ctx.createGain();
    fizzGain.gain.setValueAtTime(0.18, now + 0.025);
    fizzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    fizzSource.connect(fizzFilter);
    fizzFilter.connect(fizzGain);
    fizzGain.connect(ctx.destination);
    fizzSource.start(now + 0.025);
    fizzSource.stop(now + 0.45);
  } catch (e) {
    console.warn("Web Audio API warning:", e);
  }
};
