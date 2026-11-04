import React from "react";
import { DisplayMode } from "app/hooks/use-pomodoro.hook";
import styles from "./wled-pomo.module.css";

export const StripPreview: React.FC<{
  ratio: number;
  markerRatio: number | null;
  cells: number;
  className?: string;
}> = ({ ratio, markerRatio, cells, className }) => {
  const filled = Math.round(ratio * cells);
  const marker =
    markerRatio === null
      ? -1
      : Math.min(cells - 1, Math.floor(markerRatio * cells));
  return (
    <span className={`${styles["strip"]} ${className ?? ""}`} aria-hidden>
      {Array.from({ length: cells }, (_, i) => (
        <span
          key={i}
          className={[
            styles["cell"],
            i < filled && styles["cell-on"],
            i === marker && styles["cell-tip"],
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </span>
  );
};

// Cell sizes in px of a 56 x 6 icon, drawn with crispEdges so they stay sharp
const MODE_CELLS: Record<DisplayMode, { count: number; width: number }> = {
  bar: { count: 14, width: 3 },
  quarters: { count: 4, width: 12 },
  solid: { count: 1, width: 56 },
};

export const ModeIcon: React.FC<{ mode: DisplayMode }> = ({ mode }) => {
  const { count, width } = MODE_CELLS[mode];
  const cells = Array.from({ length: count }, (_, i) => (
    <rect key={i} x={(i * 56) / count} y={0} width={width} height={6} />
  ));
  return (
    <svg
      className={styles["mini"]}
      data-mode={mode}
      viewBox="0 0 56 6"
      width={56}
      height={6}
      shapeRendering="crispEdges"
      aria-hidden
    >
      <g className={styles["mini-base"]}>{cells}</g>
      <g className={styles["mini-fill"]}>{cells}</g>
    </svg>
  );
};
