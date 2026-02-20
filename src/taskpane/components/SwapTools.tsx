import * as React from "react";
import { Button, makeStyles, Tooltip } from "@fluentui/react-components";
import {
  ArrowSwapRegular,
  ArrowLeftRegular,
  ArrowDownRegular,
  CenterHorizontalRegular,
} from "@fluentui/react-icons";
import { swapPosition, swapHorizontal, swapVertical, swapCenter } from "../../core/swapOperations";

interface SwapToolsProps {
  onStatus: (message: string, type: "success" | "error" | "info") => void;
}

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
  },
});

const SwapTools: React.FC<SwapToolsProps> = ({ onStatus }) => {
  const styles = useStyles();

  const run = async (fn: () => Promise<void>, successMsg: string) => {
    try {
      await fn();
      onStatus(successMsg, "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      onStatus(message, "error");
    }
  };

  return (
    <div className={styles.grid}>
      <Tooltip content="Exchange positions of two shapes (top-left swap)" relationship="description">
        <Button
          size="small"
          icon={<ArrowSwapRegular />}
          onClick={() => run(swapPosition, "Positions swapped")}
        >
          Swap
        </Button>
      </Tooltip>
      <Tooltip content="Swap horizontal positions only" relationship="description">
        <Button
          size="small"
          icon={<ArrowLeftRegular />}
          onClick={() => run(swapHorizontal, "Swapped horizontally")}
        >
          Swap H
        </Button>
      </Tooltip>
      <Tooltip content="Swap vertical positions only" relationship="description">
        <Button
          size="small"
          icon={<ArrowDownRegular />}
          onClick={() => run(swapVertical, "Swapped vertically")}
        >
          Swap V
        </Button>
      </Tooltip>
      <Tooltip content="Swap by center points (for different sizes)" relationship="description">
        <Button
          size="small"
          icon={<CenterHorizontalRegular />}
          onClick={() => run(swapCenter, "Swapped by center")}
        >
          Center
        </Button>
      </Tooltip>
    </div>
  );
};

export default SwapTools;
