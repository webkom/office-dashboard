import React, { useEffect, useState } from "react";

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "min" | "max"
> & {
  value: number | null;
  min: number;
  max: number;
  onValue: (value: number | null) => void;
  onEnter?: () => void;
};

/** Keeps its own text so it can be cleared while typing; snaps back on blur */
const NumberField: React.FC<Props> = ({
  value,
  min,
  max,
  onValue,
  onEnter,
  ...rest
}) => {
  const shown = value === null ? "" : String(value);
  const [text, setText] = useState(shown);
  useEffect(() => setText(shown), [shown]);

  return (
    <input
      {...rest}
      type="number"
      min={min}
      max={max}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number(e.target.value);
        onValue(
          e.target.value.trim() === "" || !Number.isFinite(n)
            ? null
            : Math.min(max, Math.max(min, Math.round(n))),
        );
      }}
      onBlur={() => setText(shown)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEnter?.();
      }}
    />
  );
};

export default NumberField;
