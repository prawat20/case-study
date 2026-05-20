/**
 * Tiny Web Audio chimes — no asset shipping required.
 * v2: gains dropped ~30% from v1 (cream/light context calls for quieter feedback).
 */

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

function tone({ freq, start, dur, gain }: { freq: number; start: number; dur: number; gain: number }) {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, now + start);
  g.gain.linearRampToValueAtTime(gain, now + start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(now + start);
  osc.stop(now + start + dur);
}

/* ───────── Single soft pluck — capture confirmation ───────── */
export function playCaptureChime() {
  tone({ freq: 880.0, start: 0, dur: 0.14, gain: 0.045 });
}

/* ───────── Triage tones by action ───────── */
export function playTriageTone(action: "promote" | "escalate" | "defer") {
  const map = {
    defer: 392.0, // G4
    escalate: 493.88, // B4
    promote: 587.33, // D5
  };
  tone({ freq: map[action], start: 0, dur: 0.16, gain: 0.05 });
}

/* ───────── Commit — two-tone D5 + A5 ───────── */
export function playCommitChime() {
  tone({ freq: 587.33, start: 0, dur: 0.18, gain: 0.055 });
  tone({ freq: 880.0, start: 0.06, dur: 0.22, gain: 0.055 });
}

/* ───────── Defer tick (legacy single tone) ───────── */
export function playDeferTick() {
  tone({ freq: 392.0, start: 0, dur: 0.12, gain: 0.035 });
}

/* ───────── Snap-as-plan — three-note resolving ───────── */
export function playSnapChime() {
  tone({ freq: 523.25, start: 0, dur: 0.32, gain: 0.04 });
  tone({ freq: 659.25, start: 0.05, dur: 0.36, gain: 0.04 });
  tone({ freq: 783.99, start: 0.1, dur: 0.42, gain: 0.04 });
}
