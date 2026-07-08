import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import GridButton from "../primitives/GridButton";
import ProgressBar from "../primitives/ProgressBar";
import { TransposeIcon, AlignToCellIcon } from "../primitives/icons";
import { transposeTable, alignShapesToCells } from "../../../core/tableTools";
import { useTransientStatus } from "../useTransientStatus";
import { OnError } from "../App";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "6px",
  },
  icon: {
    display: "grid",
    placeItems: "center",
    width: "17px",
    height: "17px",
  },
  helper: {
    fontSize: "11.5px",
    color: tokens.textFaint,
    marginTop: "8px",
  },
  bar: {
    marginTop: "6px",
  },
});

const TableToolsSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [busyAction, setBusyAction] = useState<"transpose" | "align" | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, showStatus] = useTransientStatus(3000);
  const busy = busyAction !== null;

  const handleTranspose = async () => {
    setBusyAction("transpose");
    setProgress(0);
    try {
      const result = await transposeTable(setProgress);
      showStatus(`Transposed to ${result.rows}×${result.columns} ✓`);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Transpose failed");
    } finally {
      setBusyAction(null);
    }
  };

  const handleAlign = async () => {
    setBusyAction("align");
    setProgress(0);
    try {
      const moved = await alignShapesToCells(setProgress);
      showStatus(`Aligned ${moved} ✓`);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Aligning shapes failed");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div>
      <SectionHeader label="Table Tools" right={status ?? ""} rightColor={tokens.success} />
      <div className={styles.grid}>
        <GridButton
          title="Switch the selected table's rows and columns"
          height={36}
          fontSize="12.5px"
          disabled={busy}
          onClick={handleTranspose}
        >
          <span className={styles.icon}>
            <TransposeIcon />
          </span>
          <span>{busyAction === "transpose" ? "Transposing…" : "Transpose"}</span>
        </GridButton>
        <GridButton
          title="Center selected shapes in their cells — or select just the table to re-snap everything on it"
          height={36}
          fontSize="12.5px"
          disabled={busy}
          onClick={handleAlign}
        >
          <span className={styles.icon}>
            <AlignToCellIcon />
          </span>
          <span>{busyAction === "align" ? "Aligning…" : "Align to Cells"}</span>
        </GridButton>
      </div>
      {busy && (
        <div className={styles.bar}>
          <ProgressBar fraction={progress} />
        </div>
      )}
      <div className={styles.helper}>
        Transpose swaps rows and columns. Align centers selected shapes in the cells beneath them — after moving a
        table, select just the table and click Align to re-snap everything on it.
      </div>
    </div>
  );
};

export default TableToolsSection;
