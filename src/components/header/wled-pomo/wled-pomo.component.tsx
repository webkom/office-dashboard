import React, { useEffect, useRef, useState } from "react";
import Clock from "app/components/header/clock/clock.component";
import { useOfficeStrip } from "app/hooks/use-office-strip.hook";
import {
  DISPLAY_MODES,
  DisplayMode,
  PomoStatus,
  formatPomoTime,
} from "app/hooks/use-pomodoro.hook";
import { ModeIcon, StripPreview } from "./led-strips";
import Rounds from "./rounds";
import RunningActions from "./running-actions";
import StartOptions from "./start-options";
import styles from "./wled-pomo.module.css";

const MODE_TEXT: Record<DisplayMode, { label: string; hint: string }> = {
  bar: { label: "fyll", hint: "Stripen fylles jevnt" },
  quarters: { label: "steg", hint: "Stripen fylles i fire steg" },
  solid: { label: "slutt", hint: "Stripen skifter først når tiden er ute" },
  theme: {
    label: "glitre",
    hint: "Som fyll, men glitrende, slik lyset før økten beveget seg",
  },
};

const MODE_PARTS = [
  { part: "work", label: "jobb" },
  { part: "break", label: "pause" },
] as const;

const toneOf = (status: PomoStatus) => {
  if (!status.isRunning) return "idle";
  if (status.isPaused) return "paused";
  return status.phase === "work" ? "work" : "break";
};

const phaseText = (status: PomoStatus) => {
  if (status.isPaused) return "På vent";
  if (status.phase === "work") return "Jobb";
  if (status.phase === "long-break") return "Lang pause";
  return "Pause";
};

/** The header clock, with the office pomodoro hidden in it. Only clickable
 * where the strip answers, i.e. on the office network. */
const WledPomo: React.FC = () => {
  const { pomo, lights } = useOfficeStrip();
  const { status } = pomo;
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  // Read through a ref so the listener isn't re-added on every tick
  const pomoRef = useRef(pomo);
  pomoRef.current = pomo;
  const lightsRef = useRef(lights);
  lightsRef.current = lights;
  // Shortcuts work anywhere on the page, not just with the menu open, but
  // not while typing or together with the browser's own (Cmd/Ctrl/Alt)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const { target } = e;
      const typing =
        target instanceof Element &&
        target.closest("input, textarea, select, [contenteditable]");
      if (typing) return;
      const p = pomoRef.current;
      if (!p.status.isReachable) return;
      const key = e.key.toLowerCase();
      if (key === "escape") return setIsOpen(false);

      const forward = () => p.scrub(1);
      const back = () => p.scrub(-1);
      const whileRunning: Record<string, () => void> = {
        " ": p.togglePause,
        p: p.togglePause,
        s: p.skipPhase,
        r: p.restartPhase,
        q: () => void p.stopSession(),
        b: p.cycleMode,
        m: p.cycleMode,
        arrowright: forward,
        arrowup: forward,
        "+": forward,
        "=": forward,
        arrowleft: back,
        arrowdown: back,
        "-": back,
      };
      const action =
        key === "l"
          ? lightsRef.current.toggle
          : p.status.isRunning
            ? whileRunning[key]
            : undefined;
      if (action) {
        e.preventDefault();
        action();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className={styles["wrapper"]}
      data-tone={toneOf(status)}
      data-colours={status.phase === "work" ? "work" : "break"}
      ref={wrapperRef}
    >
      <button
        type="button"
        className={styles["clock"]}
        disabled={!status.isReachable}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={status.isReachable ? isOpen : undefined}
        // Idle, the clock's own weekday and time labels are read out
        aria-label={
          status.isRunning
            ? `Pomodoro, ${phaseText(status)}, ${formatPomoTime(status.remainingMs)} igjen`
            : undefined
        }
      >
        <Clock
          override={
            status.isRunning
              ? {
                  label: phaseText(status),
                  time: formatPomoTime(status.remainingMs),
                }
              : undefined
          }
        />
        <span
          className={`${styles["clock-strip"]} ${
            status.isRunning ? styles["clock-strip-live"] : ""
          }`}
        >
          <StripPreview
            ratio={status.fillRatio}
            markerRatio={status.isPaused ? status.rawFillRatio : null}
            cells={16}
          />
        </span>
        <Rounds status={status} config={pomo.config} />
      </button>

      {isOpen && status.isReachable && (
        <div className={styles["sheet"]} role="dialog" aria-label="Pomodoro">
          {status.isRunning ? (
            <RunningActions pomo={pomo} lights={lights} />
          ) : (
            <StartOptions
              pomo={pomo}
              lights={lights}
              onStarted={() => setIsOpen(false)}
            />
          )}

          {/* How the strip fills, for work and for breaks. Only while one
              runs, since that is when the strip shows it. */}
          {status.isRunning && (
            <div className={styles["foot"]}>
              <span className={styles["mode-rows"]}>
                {MODE_PARTS.map(({ part, label }) => {
                  const current = pomo.config[`${part}Mode`];
                  const isNow = (status.phase === "work") === (part === "work");
                  return (
                    <span
                      key={part}
                      className={`${styles["modes"]} ${isNow ? styles["modes-now"] : ""}`}
                      data-colours={part}
                    >
                      <span className={styles["modes-label"]}>{label}</span>
                      {DISPLAY_MODES.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          className={
                            current === mode ? styles["mode-active"] : ""
                          }
                          onClick={() => pomo.setDisplayMode(part, mode)}
                          title={`${MODE_TEXT[mode].hint}${isNow ? " (B)" : ""}`}
                        >
                          <ModeIcon mode={mode} />
                          {MODE_TEXT[mode].label}
                        </button>
                      ))}
                    </span>
                  );
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WledPomo;
