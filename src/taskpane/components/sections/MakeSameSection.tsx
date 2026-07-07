import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import GridButton from "../primitives/GridButton";
import { makeSame, StyleAspect } from "../../../core/copyStyle";
import { useTransientStatus } from "../useTransientStatus";
import { OnError } from "../App";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "6px",
  },
});

const BUTTONS: { short: string; label: string; aspect: StyleAspect }[] = [
  { short: "Fill", label: "Copy fill from reference shape", aspect: "fill" },
  { short: "Border", label: "Copy border from reference shape", aspect: "border" },
  { short: "Font", label: "Copy font from reference shape", aspect: "font" },
  { short: "All", label: "Copy all formatting from reference shape", aspect: "all" },
];

const MakeSameSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [status, showStatus] = useTransientStatus();

  const run = async (aspect: StyleAspect) => {
    try {
      await makeSame(aspect);
      showStatus("Applied ✓");
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Copy style failed");
    }
  };

  return (
    <div>
      <SectionHeader
        label="Make Same"
        right={status ?? "copy style from reference"}
        rightColor={status ? tokens.success : tokens.textDisabled}
      />
      <div className={styles.grid}>
        {BUTTONS.map(({ short, label, aspect }) => (
          <GridButton key={short} title={label} height={36} onClick={() => run(aspect)}>
            <span>{short}</span>
          </GridButton>
        ))}
      </div>
    </div>
  );
};

export default MakeSameSection;
