import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import GridButton from "../primitives/GridButton";
import { MatchWidthIcon, MatchHeightIcon, MatchBothIcon } from "../primitives/icons";
import { matchSize, MatchDimension } from "../../../core/matchSize";
import { useTransientStatus } from "../useTransientStatus";
import { OnError } from "../App";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "6px",
  },
  icon: {
    display: "grid",
    placeItems: "center",
    width: "15px",
    height: "15px",
  },
});

const BUTTONS: { short: string; label: string; dimension: MatchDimension; icon: React.FC }[] = [
  { short: "Width", label: "Match width", dimension: "width", icon: MatchWidthIcon },
  { short: "Height", label: "Match height", dimension: "height", icon: MatchHeightIcon },
  { short: "Both", label: "Match width and height", dimension: "both", icon: MatchBothIcon },
];

const MatchSizeSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [status, showStatus] = useTransientStatus();

  const run = async (dimension: MatchDimension) => {
    try {
      await matchSize(dimension);
      showStatus("Matched ✓");
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Match size failed");
    }
  };

  return (
    <div>
      <SectionHeader
        label="Match Size"
        right={status ?? "to last-selected shape"}
        rightColor={status ? tokens.success : tokens.textDisabled}
      />
      <div className={styles.grid}>
        {BUTTONS.map(({ short, label, dimension, icon: Icon }) => (
          <GridButton key={short} title={label} height={36} onClick={() => run(dimension)}>
            <span className={styles.icon}>
              <Icon />
            </span>
            <span>{short}</span>
          </GridButton>
        ))}
      </div>
    </div>
  );
};

export default MatchSizeSection;
