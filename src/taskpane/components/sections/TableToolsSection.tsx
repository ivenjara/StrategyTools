import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import GridButton from "../primitives/GridButton";
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
});

const TableToolsSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [busy, setBusy] = useState(false);
  const [status, showStatus] = useTransientStatus(3000);

  const handleTranspose = async () => {
    setBusy(true);
    try {
      const result = await transposeTable();
      showStatus(`Transposed to ${result.rows}×${result.columns} ✓`);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Transpose failed");
    } finally {
      setBusy(false);
    }
  };

  const handleAlign = async () => {
    setBusy(true);
    try {
      const moved = await alignShapesToCells();
      showStatus(`Aligned ${moved} ✓`);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Aligning shapes failed");
    } finally {
      setBusy(false);
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
          <span>Transpose</span>
        </GridButton>
        <GridButton
          title="Center selected shapes inside the table cells beneath them"
          height={36}
          fontSize="12.5px"
          disabled={busy}
          onClick={handleAlign}
        >
          <span className={styles.icon}>
            <AlignToCellIcon />
          </span>
          <span>Align to Cells</span>
        </GridButton>
      </div>
      <div className={styles.helper}>
        Transpose swaps rows and columns. Align centers selected shapes in the cells beneath them.
      </div>
    </div>
  );
};

export default TableToolsSection;
