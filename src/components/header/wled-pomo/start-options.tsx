import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { PomoConfig, useWledPomo } from "app/hooks/use-wled-pomo.hook";
import NumberField from "./number-field";
import LightControls from "./light-controls";
import Row from "./row";
import styles from "./wled-pomo.module.css";

type Pomo = ReturnType<typeof useWledPomo>;
type Preset = Pick<PomoConfig, "workMs" | "breakMs" | "longBreakMs">;

const MIN = 60 * 1000;

const PRESETS: Preset[] = [
  { workMs: 25 * MIN, breakMs: 5 * MIN, longBreakMs: 15 * MIN },
  { workMs: 50 * MIN, breakMs: 10 * MIN, longBreakMs: 30 * MIN },
];

// Only offered in ?wled=mock
const TEST_PRESET: Preset = {
  workMs: 30 * 1000,
  breakMs: 10 * 1000,
  longBreakMs: null,
};

const minutes = (ms: number) => Math.max(1, Math.round(ms / MIN));
const amount = (ms: number) =>
  ms < MIN ? `${Math.round(ms / 1000)}` : `${minutes(ms)}`;
const unit = (ms: number) => (ms < MIN ? "sek" : "min");

const StartOptions: React.FC<{ pomo: Pomo; onStarted: () => void }> = ({
  pomo,
  onStarted,
}) => {
  const { status, config, updateConfig } = pomo;

  const start = (preset: Preset) => {
    void pomo.startSession(preset);
    onStarted();
  };
  const startCustom = () => start(config);

  const presets = status.isMock ? [...PRESETS, TEST_PRESET] : PRESETS;

  return (
    <ul className={styles["options"]}>
      {presets.map((preset, i) => (
        <Row key={i} index={i} onClick={() => start(preset)}>
          <span className={styles["work"]}>
            {amount(preset.workMs)}
            <small>{unit(preset.workMs)}</small>
          </span>
          <span className={styles["rest"]}>
            {amount(preset.breakMs)} {unit(preset.breakMs)} pause
            {preset.longBreakMs && (
              <span className={styles["sub"]}>
                + {amount(preset.longBreakMs)} {unit(preset.longBreakMs)} hver{" "}
                {config.longBreakEvery}. runde
              </span>
            )}
          </span>
        </Row>
      ))}

      <li
        className={styles["custom"]}
        style={{ "--i": presets.length } as React.CSSProperties}
      >
        <div className={styles["custom-line"]}>
          <NumberField
            className={styles["work"]}
            min={1}
            max={240}
            aria-label="Jobb, minutter"
            value={minutes(config.workMs)}
            onValue={(m) => m && updateConfig({ workMs: m * MIN })}
            onEnter={startCustom}
          />
          <small>min</small>
          <NumberField
            className={styles["rest"]}
            min={1}
            max={120}
            aria-label="Pause, minutter"
            value={minutes(config.breakMs)}
            onValue={(m) => m && updateConfig({ breakMs: m * MIN })}
            onEnter={startCustom}
          />
          <span className={styles["rest"]}>min pause</span>
          <button
            type="button"
            className={styles["go-btn"]}
            onClick={startCustom}
            aria-label="Start egen økt (Enter)"
          >
            <FontAwesomeIcon icon={faArrowRight as IconProp} />
          </button>
        </div>
        <div className={styles["sub"]}>
          +{" "}
          <NumberField
            min={0}
            max={120}
            placeholder="–"
            aria-label="Lang pause, minutter (tom for av)"
            value={config.longBreakMs ? minutes(config.longBreakMs) : null}
            onValue={(m) => updateConfig({ longBreakMs: m ? m * MIN : null })}
            onEnter={startCustom}
          />{" "}
          min hver{" "}
          <NumberField
            min={2}
            max={12}
            aria-label="Lang pause etter så mange runder"
            value={config.longBreakEvery}
            onValue={(n) => n && updateConfig({ longBreakEvery: n })}
            onEnter={startCustom}
          />
          <span>. runde</span>
        </div>
      </li>

      <LightControls pomo={pomo} index={presets.length + 1} />

      {status.orphaned && (
        <Row
          index={presets.length + 2}
          danger
          onClick={() => void pomo.restoreLights()}
        >
          <span className={styles["action"]}>Gjenopprett lysene</span>
        </Row>
      )}
    </ul>
  );
};

export default StartOptions;
