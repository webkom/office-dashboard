import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { useWledPomo } from "app/hooks/use-wled-pomo.hook";
import { LIGHT_PRESETS } from "app/utils/light-presets";
import { LightSettings } from "app/utils/wled";
import { StripPreview } from "./led-strips";
import styles from "./wled-pomo.module.css";

type Pomo = ReturnType<typeof useWledPomo>;

const EFFECTS: { key: keyof LightSettings; label: string; hint: string }[] = [
  {
    key: "birthday",
    label: "bursdag",
    hint: "Fyrverkeri når noen med bursdag sjekker inn",
  },
  { key: "merges", label: "pr", hint: "En grønn bølge når en PR merges" },
  { key: "evening", label: "kveld", hint: "Kveldslys fra 20 til 06" },
];

/** The room's light switch: power, brightness and a few looks */
const LightControls: React.FC<{ pomo: Pomo; index: number }> = ({
  pomo,
  index,
}) => {
  const { status } = pomo;
  const level = status.isOn ? status.bri / 255 : 0;

  return (
    <li
      className={styles["lights"]}
      style={
        {
          "--i": index,
          "--light": `rgb(${status.lightColor.join(",")})`,
        } as React.CSSProperties
      }
      data-on={status.isOn || undefined}
    >
      <div className={styles["light-line"]}>
        <button
          type="button"
          className={styles["power"]}
          onClick={pomo.toggleLights}
          aria-pressed={status.isOn}
          aria-label="Lys av og på"
          title="Lys av og på (L)"
        >
          <FontAwesomeIcon icon={faPowerOff as IconProp} />
        </button>
        <label className={styles["dimmer"]}>
          <StripPreview ratio={level} markerRatio={null} cells={16} />
          <input
            type="range"
            min={1}
            max={255}
            value={status.bri}
            onChange={(e) => pomo.setBrightness(Number(e.target.value))}
            aria-label="Lysstyrke"
          />
        </label>
        <span className={styles["pct"]}>
          {status.isOn ? `${Math.round(level * 100)}%` : "av"}
        </span>
      </div>

      <div className={styles["presets"]}>
        {LIGHT_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={
              status.isOn && status.preset?.id === p.id
                ? styles["preset-active"]
                : ""
            }
            onClick={() => pomo.applyPreset(p)}
          >
            <span className={styles["swatch"]} data-preset={p.id} />
            {p.name}
          </button>
        ))}
      </div>

      <div className={styles["effects"]}>
        {EFFECTS.map(({ key, label, hint }) => (
          <button
            key={key}
            type="button"
            aria-pressed={status.effects[key]}
            title={`${hint}, for hele kontoret`}
            onClick={() => pomo.setEffect(key, !status.effects[key])}
          >
            <span className={styles["effect-dot"]} />
            {label}
          </button>
        ))}
      </div>

      {status.officeEmpty && (
        <span className={styles["sub"]}>Ingen sjekket inn på kontoret</span>
      )}
    </li>
  );
};

export default LightControls;
