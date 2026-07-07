import * as React from "react";
import { makeStyles } from "@griffel/react";
import SectionHeader from "../primitives/SectionHeader";
import GridButton from "../primitives/GridButton";
import { SwapIcon, SwapHIcon, SwapVIcon, TopLeftIcon } from "../primitives/icons";
import { swapPosition, swapHorizontal, swapVertical, swapTopLeft } from "../../../core/swapOperations";
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
});

const BUTTONS: { label: string; fn: () => Promise<void>; icon: React.FC }[] = [
  { label: "Swap", fn: swapPosition, icon: SwapIcon },
  { label: "Swap H", fn: swapHorizontal, icon: SwapHIcon },
  { label: "Swap V", fn: swapVertical, icon: SwapVIcon },
  { label: "Top-Left", fn: swapTopLeft, icon: TopLeftIcon },
];

const SwapSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();

  const run = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Swap failed");
    }
  };

  return (
    <div>
      <SectionHeader label="Swap Positions" />
      <div className={styles.grid}>
        {BUTTONS.map(({ label, fn, icon: Icon }) => (
          <GridButton
            key={label}
            title={label}
            height={40}
            fontSize="13px"
            gap="8px"
            style={{ padding: "0 8px" }}
            onClick={() => run(fn)}
          >
            <span className={styles.icon}>
              <Icon />
            </span>
            <span>{label}</span>
          </GridButton>
        ))}
      </div>
    </div>
  );
};

export default SwapSection;
