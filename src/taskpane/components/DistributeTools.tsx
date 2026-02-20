import * as React from "react";
import { Button, makeStyles, Tooltip } from "@fluentui/react-components";
import {
  ArrowAutofitWidthRegular,
  ArrowAutofitHeightRegular,
} from "@fluentui/react-icons";
import { distributeHorizontal, distributeVertical } from "../../core/distributeOperations";

interface DistributeToolsProps {
  onStatus: (message: string, type: "success" | "error" | "info") => void;
}

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
  },
});

const DistributeTools: React.FC<DistributeToolsProps> = ({ onStatus }) => {
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
      <Tooltip content="Distribute 3+ shapes with even horizontal spacing" relationship="description">
        <Button
          size="small"
          icon={<ArrowAutofitWidthRegular />}
          onClick={() => run(distributeHorizontal, "Distributed horizontally")}
        >
          Horizontal
        </Button>
      </Tooltip>
      <Tooltip content="Distribute 3+ shapes with even vertical spacing" relationship="description">
        <Button
          size="small"
          icon={<ArrowAutofitHeightRegular />}
          onClick={() => run(distributeVertical, "Distributed vertically")}
        >
          Vertical
        </Button>
      </Tooltip>
    </div>
  );
};

export default DistributeTools;
