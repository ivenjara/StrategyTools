import * as React from "react";
import { makeStyles, shorthands } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import GridButton from "../primitives/GridButton";
import { insertStatusStamp, StampKind } from "../../../core/statusStamps";
import { useTransientStatus } from "../useTransientStatus";
import { OnError } from "../App";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "6px",
  },
  pill: {
    fontSize: "10.5px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    padding: "3px 8px",
    borderRadius: "4px",
    ...shorthands.borderWidth("1.5px"),
    ...shorthands.borderStyle("solid"),
    transform: "rotate(-4deg)",
  },
  helper: {
    fontSize: "11.5px",
    color: tokens.textFaint,
    marginTop: "8px",
  },
});

const STAMPS: { kind: StampKind; color: string }[] = [
  { kind: "WIP", color: tokens.warn },
  { kind: "FINAL", color: tokens.success },
  { kind: "CONFIDENTIAL", color: tokens.danger },
];

const StatusStampsSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [status, showStatus] = useTransientStatus();

  const stamp = async (kind: StampKind) => {
    try {
      const count = await insertStatusStamp(kind);
      showStatus(`Stamped ${count} slide${count > 1 ? "s" : ""} ✓`);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Stamping failed");
    }
  };

  return (
    <div>
      <SectionHeader label="Status Stamps" right={status ?? ""} rightColor={tokens.success} />
      <div className={styles.grid}>
        {STAMPS.map(({ kind, color }) => (
          <GridButton key={kind} title={`Stamp "${kind}"`} height={40} onClick={() => stamp(kind)}>
            <span className={styles.pill} style={{ color, borderColor: color }}>
              {kind}
            </span>
          </GridButton>
        ))}
      </div>
      <div className={styles.helper}>Stamps the top-right corner of selected slides.</div>
    </div>
  );
};

export default StatusStampsSection;
