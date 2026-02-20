import * as React from "react";
import { Button, makeStyles, Tooltip } from "@fluentui/react-components";
import {
  AlignLeftRegular,
  AlignRightRegular,
  AlignCenterHorizontalRegular,
  AlignTopRegular,
  AlignBottomRegular,
  AlignCenterVerticalRegular,
} from "@fluentui/react-icons";
import {
  alignLeft,
  alignRight,
  alignCenter,
  alignTop,
  alignBottom,
  alignMiddle,
} from "../../core/alignOperations";

interface AlignToolsProps {
  onStatus: (message: string, type: "success" | "error" | "info") => void;
}

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "6px",
  },
});

const AlignTools: React.FC<AlignToolsProps> = ({ onStatus }) => {
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
      <Tooltip content="Align to leftmost edge" relationship="description">
        <Button
          size="small"
          icon={<AlignLeftRegular />}
          onClick={() => run(alignLeft, "Aligned left")}
        >
          Left
        </Button>
      </Tooltip>
      <Tooltip content="Align to horizontal center" relationship="description">
        <Button
          size="small"
          icon={<AlignCenterHorizontalRegular />}
          onClick={() => run(alignCenter, "Aligned center")}
        >
          Center
        </Button>
      </Tooltip>
      <Tooltip content="Align to rightmost edge" relationship="description">
        <Button
          size="small"
          icon={<AlignRightRegular />}
          onClick={() => run(alignRight, "Aligned right")}
        >
          Right
        </Button>
      </Tooltip>
      <Tooltip content="Align to topmost edge" relationship="description">
        <Button
          size="small"
          icon={<AlignTopRegular />}
          onClick={() => run(alignTop, "Aligned top")}
        >
          Top
        </Button>
      </Tooltip>
      <Tooltip content="Align to vertical center" relationship="description">
        <Button
          size="small"
          icon={<AlignCenterVerticalRegular />}
          onClick={() => run(alignMiddle, "Aligned middle")}
        >
          Middle
        </Button>
      </Tooltip>
      <Tooltip content="Align to bottommost edge" relationship="description">
        <Button
          size="small"
          icon={<AlignBottomRegular />}
          onClick={() => run(alignBottom, "Aligned bottom")}
        >
          Bottom
        </Button>
      </Tooltip>
    </div>
  );
};

export default AlignTools;
