export type Cue = "start" | "break" | "work";

// start: two quick rising notes. break: slow falling chime. work: three rising notes.
const TONES: Record<
  Cue,
  { notes: number[]; step: number; decay: number; type: OscillatorType }
> = {
  start: { notes: [587.33, 880], step: 0.09, decay: 0.22, type: "triangle" },
  break: {
    notes: [783.99, 659.25, 523.25],
    step: 0.22,
    decay: 0.9,
    type: "sine",
  },
  work: {
    notes: [523.25, 659.25, 783.99],
    step: 0.12,
    decay: 0.3,
    type: "triangle",
  },
};

export function playCue(cue: Cue) {
  try {
    const ctx = new AudioContext();
    const { notes, step, decay, type } = TONES[cue];
    notes.forEach((freq, idx) => {
      const start = ctx.currentTime + idx * step;
      const length =
        idx === notes.length - 1 ? decay : Math.min(decay, step * 2.5);
      // A quiet octave on top makes it bell-like
      for (const [f, level] of [
        [freq, 0.14],
        [freq * 2, 0.03],
      ]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(level, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + length + 0.05);
      }
    });
    const totalMs = ((notes.length - 1) * step + decay) * 1000;
    window.setTimeout(() => void ctx.close().catch(() => {}), totalMs + 500);
  } catch {
    // Audio can be blocked until the page has had a user gesture
  }
}

export function announce(cue: Cue, title: string, body: string) {
  playCue(cue);
  try {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      new Notification(title, { body });
    }
  } catch {
    // Notifications are optional
  }
}
