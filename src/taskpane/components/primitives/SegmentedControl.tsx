import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";

const useStyles = makeStyles({
  track: {
    display: "grid",
    backgroundColor: tokens.segTrack,
    border: `1px solid ${tokens.borderControl}`,
    borderRadius: tokens.radiusButton,
    padding: "3px",
    gap: "3px",
  },
  segment: {
    height: "30px",
    border: "none",
    borderRadius: tokens.radiusSegment,
    cursor: "pointer",
    fontFamily: "inherit",
  },
});

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  fontSize?: string;
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  fontSize = "12.5px",
}: SegmentedControlProps<T>): JSX.Element {
  const styles = useStyles();
  return (
    <div className={styles.track} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            className={styles.segment}
            style={{
              fontSize,
              backgroundColor: active ? tokens.segActive : "transparent",
              color: active ? tokens.textStrong : tokens.textMuted,
              fontWeight: active ? 600 : 400,
            }}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
