import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import Clock from "app/components/header/clock/clock.component";
import {
  DISPLAY_MODES,
  DisplayMode,
  PomoStatus,
  formatPomoTime,
  useWledPomo,
} from "app/hooks/use-wled-pomo.hook";
import { ModeIcon, StripPreview } from "./led-strips";
import Rounds from "./rounds";
import RunningActions from "./running-actions";
import StartOptions from "./start-options";
import styles from "./wled-pomo.module.css";

const MODE_TEXT: Record<DisplayMode, { label: string; hint: string }> = {
  bar: { label: "fyll", hint: "Stripen fylles jevnt" },
  quarters: { label: "kvartaler", hint: "Stripen fylles i fire steg" },
  solid: { label: "slutt", hint: "Stripen skifter først når tiden er ute" },
};

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
  const pomo = useWledPomo();
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
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const p = pomoRef.current;
      const key = e.key.toLowerCase();
      if (key === "escape") return setIsOpen(false);
      if ((e.target as HTMLElement | null)?.tagName === "INPUT") return;

      const forward = () => p.scrub(1);
      const back = () => p.scrub(-1);
      const whileRunning: Record<string, () => void> = {
        " ": p.togglePause,
        p: p.togglePause,
        s: p.skipPhase,
        r: p.restartPhase,
        q: () => void p.stopSession(),
        arrowright: forward,
        arrowup: forward,
        "+": forward,
        "=": forward,
        arrowleft: back,
        arrowdown: back,
        "-": back,
      };
      const action =
        key === "b" || key === "m"
          ? p.cycleMode
          : p.status.isRunning
            ? whileRunning[key]
            : key === "l"
              ? p.toggleLights
              : undefined;
      if (action) {
        e.preventDefault();
        action();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <div
      className={styles["wrapper"]}
      data-tone={toneOf(status)}
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
            ratio={status.blueRatio}
            markerRatio={status.isPaused ? status.rawBlueRatio : null}
            cells={16}
          />
        </span>
        <Rounds status={status} config={pomo.config} />
      </button>

      {isOpen && status.isReachable && (
        <div className={styles["sheet"]} role="dialog" aria-label="Pomodoro">
          {status.isRunning ? (
            <RunningActions pomo={pomo} />
          ) : (
            <StartOptions pomo={pomo} onStarted={() => setIsOpen(false)} />
          )}

          <div className={styles["foot"]}>
            <span className={styles["modes"]}>
              {DISPLAY_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={
                    status.displayMode === mode ? styles["mode-active"] : ""
                  }
                  onClick={() => pomo.setDisplayMode(mode)}
                  title={`${MODE_TEXT[mode].hint} (B)`}
                >
                  <ModeIcon mode={mode} />
                  {MODE_TEXT[mode].label}
                </button>
              ))}
            </span>
            <button
              type="button"
              className={styles["icon"]}
              onClick={pomo.toggleMute}
              aria-label={status.mute ? "Slå på lyd" : "Slå av lyd"}
              title={status.mute ? "Slå på lyd" : "Slå av lyd"}
            >
              <FontAwesomeIcon
                icon={(status.mute ? faVolumeXmark : faVolumeHigh) as IconProp}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WledPomo;
