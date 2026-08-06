// Custom Audio Sound Effects (Brindisi & Stappo)

export const playClinkSound = () => {
  try {
    const audio = new Audio('/sounds/brindisi.mp3');
    audio.volume = 0.85;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const fallbackAudio = new Audio('/sounds/brindisi.mp4');
        fallbackAudio.volume = 0.85;
        fallbackAudio.play().catch(() => {
          playClinkSynthFallback();
        });
      });
    }
  } catch (e) {
    playClinkSynthFallback();
  }
};

export const playPopSound = () => {
  try {
    const audio = new Audio('/sounds/stappo.mp3');
    audio.volume = 0.9;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const fallbackAudio = new Audio('/sounds/stappo.mp4');
        fallbackAudio.volume = 0.9;
        fallbackAudio.play().catch(() => {
          playPopSynthFallback();
        });
      });
    }
  } catch (e) {
    playPopSynthFallback();
  }
};

// Web Audio API Synthesizer Fallbacks
function playClinkSynthFallback() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(2150, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(2140, now + 0.4);

    bodyGain.gain.setValueAtTime(0.28, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.45);
  } catch (e) {}
}

function playPopSynthFallback() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(580, now);
    popOsc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    popGain.gain.setValueAtTime(0.55, now);
    popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

    popOsc.connect(popGain);
    popGain.connect(ctx.destination);
    popOsc.start(now);
    popOsc.stop(now + 0.085);
  } catch (e) {}
}
