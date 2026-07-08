import * as React from "react";
import { makeStyles, shorthands } from "@griffel/react";
import { tokens } from "../../theme/tokens";

const useStyles = makeStyles({
  numberWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  numberLabel: {
    fontSize: "10.5px",
    color: tokens.textFaint,
  },
  numberInput: {
    width: "100%",
    height: "30px",
    padding: "0 6px",
    border: `1px solid ${tokens.borderControl}`,
    borderRadius: tokens.radiusInput,
    fontSize: "12.5px",
    color: tokens.textPrimary,
    backgroundColor: tokens.inputBg,
    outlineStyle: "none",
    ":focus": {
      ...shorthands.borderColor(tokens.accent),
    },
  },
  textWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  textLabel: {
    fontSize: "12px",
    color: tokens.textMuted,
  },
  textInput: {
    height: "34px",
    padding: "0 10px",
    border: `1px solid ${tokens.borderControl}`,
    borderRadius: tokens.radiusInput,
    fontSize: "13px",
    color: tokens.textPrimary,
    backgroundColor: tokens.inputBg,
    outlineStyle: "none",
    ":focus": {
      ...shorthands.borderColor(tokens.accent),
    },
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: tokens.textSecondary,
    cursor: "pointer",
  },
  checkboxInput: {
    width: "15px",
    height: "15px",
    accentColor: tokens.accent,
    margin: 0,
  },
  select: {
    flex: 1,
    height: "30px",
    padding: "0 8px",
    border: `1px solid ${tokens.borderControl}`,
    borderRadius: tokens.radiusInput,
    fontSize: "12.5px",
    color: tokens.textPrimary,
    backgroundColor: tokens.inputBg,
    outlineStyle: "none",
  },
});

export const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
}> = ({ label, value, onChange }) => {
  const styles = useStyles();
  return (
    <div className={styles.numberWrap}>
      <label className={styles.numberLabel}>{label}</label>
      <input
        type="number"
        step={0.05}
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
        className={styles.numberInput}
      />
    </div>
  );
};

export const TextField: React.FC<{
  label?: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  /** id of a <datalist> for suggestions */
  list?: string;
}> = ({ label, value, onChange, id, placeholder, list }) => {
  const styles = useStyles();
  return (
    <div className={styles.textWrap}>
      {label !== undefined && (
        <label className={styles.textLabel} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        list={list}
        onChange={(e) => onChange(e.target.value)}
        className={styles.textInput}
      />
    </div>
  );
};

export const Checkbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => {
  const styles = useStyles();
  return (
    <label className={styles.checkboxLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.checkboxInput}
      />
      {label}
    </label>
  );
};

export const Select: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  id?: string;
}> = ({ value, onChange, options, id }) => {
  const styles = useStyles();
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={styles.select}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
};
