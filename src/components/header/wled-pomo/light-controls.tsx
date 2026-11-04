import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { RoomLights } from "app/hooks/use-room-lights.hook";
import { LIGHT_PRESETS } from "app/utils/light-presets";
import { LightSettings } from "app/utils/wled-names";
import { StripPreview } from "./led-strips";
import styles from "./light-controls.module.css";
import menu from "./wled-pomo.module.css";

const EFFECTS: { key: keyof LightSettings; label: string; hint: string }[] = [
  {
    key: "birthday",
    label: "bursdag",
    hint: "Fyrverkeri når noen med bursdag sjekker inn",
  },
  { key: "merges", label: "pr", hint: "En grønn bølge når en PR merges" },
  { key: "evening", label: "kveld", hint: "Kveldslys fra 20 til 06" },
];

const LightControls: React.FC<{ lights: RoomLights; index: number }> = ({
  lights,
  index,
}) => {
  const { status } = lights;
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
          onClick={lights.toggle}
          aria-pressed={status.isOn}
          aria-label="Lys av og på"
          title="Lys av og på (L)"
        >
          <FontAwesomeIcon icon={faPowerOff as IconProp} />
        </button>
        <label className={styles["dimmer"]}>
          <StripPreview
            className={styles["bar"]}
            ratio={level}
            markerRatio={null}
            cells={16}
          />
          <input
            type="range"
            min={1}
            max={255}
            value={status.bri}
            onChange={(e) => lights.setBrightness(Number(e.target.value))}
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
            onClick={() => lights.applyPreset(p)}
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
            onClick={() => lights.setEffect(key, !status.effects[key])}
          >
            <span className={styles["effect-dot"]} />
            {label}
          </button>
        ))}
      </div>

      {status.officeEmpty && (
        <span className={menu["sub"]}>Ingen sjekket inn på kontoret</span>
      )}
    </li>
  );
};

export default LightControls;
