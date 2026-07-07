import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import GridButton from "../primitives/GridButton";
import {
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  DistributeHIcon,
  AlignTopIcon,
  AlignMiddleIcon,
  AlignBottomIcon,
  DistributeVIcon,
} from "../primitives/icons";
import {
  alignLeft,
  alignCenter,
  alignRight,
  alignTop,
  alignMiddle,
  alignBottom,
} from "../../../core/alignOperations";
import { distributeHorizontal, distributeVertical } from "../../../core/distributeOperations";
import { OnError } from "../App";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "6px",
  },
  icon: {
    display: "grid",
    placeItems: "center",
    width: "18px",
    height: "18px",
  },
  sublabel: {
    fontSize: "9px",
    color: tokens.textFaint,
    lineHeight: 1,
  },
});

const BUTTONS: { short: string; label: string; fn: () => Promise<void>; icon: React.FC }[] = [
  { short: "Left", label: "Align left", fn: alignLeft, icon: AlignLeftIcon },
  { short: "Center", label: "Align center", fn: alignCenter, icon: AlignCenterIcon },
  { short: "Right", label: "Align right", fn: alignRight, icon: AlignRightIcon },
  { short: "Dist H", label: "Distribute horizontally", fn: distributeHorizontal, icon: DistributeHIcon },
  { short: "Top", label: "Align top", fn: alignTop, icon: AlignTopIcon },
  { short: "Middle", label: "Align middle", fn: alignMiddle, icon: AlignMiddleIcon },
  { short: "Bottom", label: "Align bottom", fn: alignBottom, icon: AlignBottomIcon },
  { short: "Dist V", label: "Distribute vertically", fn: distributeVertical, icon: DistributeVIcon },
];

const AlignDistributeSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();

  const run = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  return (
    <div>
      <SectionHeader label="Align & Distribute" />
      <div className={styles.grid}>
        {BUTTONS.map(({ short, label, fn, icon: Icon }) => (
          <GridButton key={short} title={label} height={48} layout="column" onClick={() => run(fn)}>
            <span className={styles.icon}>
              <Icon />
            </span>
            <span className={styles.sublabel}>{short}</span>
          </GridButton>
        ))}
      </div>
    </div>
  );
};

export default AlignDistributeSection;
