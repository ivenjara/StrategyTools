import * as React from "react";
import { useState } from "react";
import { makeStyles, shorthands } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import GridButton from "../primitives/GridButton";
import EmphasizedButton from "../primitives/EmphasizedButton";
import { NumberField } from "../primitives/fields";
import { LinkIcon } from "../primitives/icons";
import { applyTextMargins, MarginsCm } from "../../../core/textMargins";
import { OnError } from "../App";

const useStyles = makeStyles({
  column: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  presets: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "6px",
  },
  fieldsRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "6px",
  },
  applyRow: {
    display: "flex",
    gap: "6px",
  },
  applyGrow: {
    flex: 1,
  },
  linkButton: {
    width: "30px",
    height: "30px",
    display: "grid",
    placeItems: "center",
    borderRadius: tokens.radiusInput,
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
    ...shorthands.borderWidth("1px"),
    ...shorthands.borderStyle("solid"),
    ":hover": {
      ...shorthands.borderColor(tokens.accent),
    },
  },
});

type MarginKey = keyof MarginsCm;

const PRESETS: { name: string; label: string; values: MarginsCm }[] = [
  { name: "None", label: "All margins 0", values: { left: 0, right: 0, top: 0, bottom: 0 } },
  { name: "Tight", label: "0.1 cm all around", values: { left: 0.1, right: 0.1, top: 0.1, bottom: 0.1 } },
  {
    name: "Normal",
    label: "PowerPoint default margins",
    values: { left: 0.25, right: 0.25, top: 0.13, bottom: 0.13 },
  },
];

const FIELDS: { label: string; key: MarginKey }[] = [
  { label: "Left (cm)", key: "left" },
  { label: "Right", key: "right" },
  { label: "Top", key: "top" },
  { label: "Bottom", key: "bottom" },
];

const TextMarginsSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [margins, setMargins] = useState<MarginsCm>(PRESETS[2].values);
  const [linked, setLinked] = useState(false);
  const [applied, setApplied] = useState(false);

  const setMargin = (key: MarginKey, value: number) => {
    setMargins(linked ? { left: value, right: value, top: value, bottom: value } : { ...margins, [key]: value });
    setApplied(false);
  };

  const applyPreset = (values: MarginsCm) => {
    setMargins({ ...values });
    setApplied(false);
  };

  const apply = async (values: MarginsCm = margins) => {
    try {
      await applyTextMargins(values);
      setApplied(true);
    } catch (err: unknown) {
      setApplied(false);
      onError(err instanceof Error ? err.message : "Applying margins failed");
    }
  };

  /** Shifts all four margins by `delta` cm and applies immediately. */
  const nudge = async (delta: number) => {
    const shift = (v: number) => Math.max(0, Math.round((v + delta) * 100) / 100);
    const next: MarginsCm = {
      left: shift(margins.left),
      right: shift(margins.right),
      top: shift(margins.top),
      bottom: shift(margins.bottom),
    };
    setMargins(next);
    await apply(next);
  };

  return (
    <div>
      <SectionHeader
        label="Text Margins"
        right={applied ? "Applied ✓" : ""}
        rightColor={applied ? tokens.success : tokens.textDisabled}
      />
      <div className={styles.column}>
        <div className={styles.presets}>
          {PRESETS.map(({ name, label, values }) => {
            const active = FIELDS.every(({ key }) => margins[key] === values[key]);
            return (
              <GridButton
                key={name}
                title={label}
                height={30}
                fontSize="12px"
                selected={active}
                onClick={() => applyPreset(values)}
                style={{ color: active ? tokens.textStrong : tokens.textMuted }}
              >
                {name}
              </GridButton>
            );
          })}
        </div>
        <div className={styles.fieldsRow}>
          {FIELDS.map(({ label, key }) => (
            <NumberField key={key} label={label} value={margins[key]} onChange={(v) => setMargin(key, v)} />
          ))}
          <button
            type="button"
            title={linked ? "Unlink margins" : "Link all margins"}
            className={styles.linkButton}
            style={{
              backgroundColor: linked ? tokens.emphBg : tokens.card,
              borderColor: linked ? tokens.accent : tokens.borderControl,
              color: linked ? tokens.accent : tokens.textMuted,
            }}
            onClick={() => setLinked(!linked)}
          >
            <LinkIcon />
          </button>
        </div>
        <div className={styles.applyRow}>
          <GridButton
            title="Decrease all margins by 0.05 cm and apply"
            height={36}
            fontSize="16px"
            onClick={() => nudge(-0.05)}
            style={{ width: "36px", flexShrink: 0 }}
          >
            −
          </GridButton>
          <GridButton
            title="Increase all margins by 0.05 cm and apply"
            height={36}
            fontSize="16px"
            onClick={() => nudge(0.05)}
            style={{ width: "36px", flexShrink: 0 }}
          >
            +
          </GridButton>
          <div className={styles.applyGrow}>
            <EmphasizedButton
              height={36}
              onClick={() => apply()}
              title="Applies to selected shapes and all cells of selected tables"
            >
              Apply to selected shapes
            </EmphasizedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextMarginsSection;
