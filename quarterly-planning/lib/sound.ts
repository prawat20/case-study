// Tiny Web Audio chime — no asset shipping required.
// Used as the "engage the senses" feedback on decision commit (DfD principle 2).

let ctx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    type WindowWithWebkit = Window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const w = window as WindowWithWebkit;
    const Ctx = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  return ctx;
}

export function playCommitChime() {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;

  // Two-note soft chime, decays fast — feels like a confirmation, not a fanfare.
  const tones = [
    { freq: 587.33, start: 0, dur: 0.18 }, // D5
    { freq: 880.0, start: 0.06, dur: 0.22 }, // A5
  ];

  for (const tone of tones) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = tone.freq;
    gain.gain.setValueAtTime(0, now + tone.start);
    gain.gain.linearRampToValueAtTime(0.08, now + tone.start + 0.01);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + tone.start + tone.dur,
    );
    osc.connect(gain).connect(ac.destination);
    osc.start(now + tone.start);
    osc.stop(now + tone.start + tone.dur);
  }
}

export function playDeferTick() {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = 392.0; // G4
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}
