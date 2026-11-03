import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./wled-pomo.module.css";

const Row: React.FC<
  React.PropsWithChildren<{
    index: number;
    onClick: () => void;
    hotkey?: string;
    danger?: boolean;
  }>
> = ({ index, onClick, hotkey, danger, children }) => (
  <li style={{ "--i": index } as React.CSSProperties}>
    <button
      type="button"
      className={`${styles["option"]} ${danger ? styles["danger"] : ""}`}
      onClick={onClick}
    >
      {children}
      {hotkey ? (
        <kbd className={styles["kbd"]}>{hotkey}</kbd>
      ) : (
        <FontAwesomeIcon
          className={styles["go"]}
          icon={faArrowRight as IconProp}
        />
      )}
    </button>
  </li>
);

export default Row;
