import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import GridButton from "../primitives/GridButton";
import { insertWipBanner } from "../../../core/statusStamps";
import { useTransientStatus } from "../useTransientStatus";
import { OnError } from "../App";

const useStyles = makeStyles({
  pill: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    padding: "3px 10px",
    borderRadius: "4px",
    backgroundColor: tokens.danger,
    color: tokens.paneBg,
  },
  helper: {
    fontSize: "11.5px",
    color: tokens.textFaint,
    marginTop: "8px",
  },
});

const StatusStampsSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [status, showStatus] = useTransientStatus();

  const stamp = async () => {
    try {
      const count = await insertWipBanner();
      showStatus(`Stamped ${count} slide${count > 1 ? "s" : ""} ✓`);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Stamping failed");
    }
  };

  return (
    <div>
      <SectionHeader label="WIP Banner" right={status ?? ""} rightColor={tokens.success} />
      <GridButton
        title="Adds a red WIP banner across the top of each selected slide"
        height={40}
        fontSize="13px"
        gap="10px"
        style={{ width: "100%" }}
        onClick={stamp}
      >
        <span className={styles.pill}>WIP</span>
        <span>Stamp selected slides</span>
      </GridButton>
      <div className={styles.helper}>Adds a full-width red banner across the top of selected slides.</div>
    </div>
  );
};

export default StatusStampsSection;
