import * as React from "react";
import { useState } from "react";
import { Button, makeStyles, Tooltip } from "@fluentui/react-components";
import {
  CopyRegular,
  ClipboardPasteRegular,
  ResizeRegular,
  ScaleFitRegular,
} from "@fluentui/react-icons";
import { copyPosition, pastePosition, pasteSize, pasteSizeOnly } from "../../core/positionClipboard";

interface PositionToolsProps {
  onStatus: (message: string, type: "success" | "error" | "info") => void;
}

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
  },
});

const PositionTools: React.FC<PositionToolsProps> = ({ onStatus }) => {
  const styles = useStyles();
  const [hasCopied, setHasCopied] = useState(false);

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
      <Tooltip content="Copy position and size of selected shape" relationship="description">
        <Button
          size="small"
          icon={<CopyRegular />}
          onClick={async () => {
            await run(copyPosition, "Position + size copied");
            setHasCopied(true);
          }}
        >
          Copy
        </Button>
      </Tooltip>
      <Tooltip content="Move selected shape(s) to the copied position" relationship="description">
        <Button
          size="small"
          icon={<ClipboardPasteRegular />}
          disabled={!hasCopied}
          onClick={() => run(pastePosition, "Position applied")}
        >
          Paste Pos
        </Button>
      </Tooltip>
      <Tooltip content="Resize selected shape(s) to match the copied size" relationship="description">
        <Button
          size="small"
          icon={<ScaleFitRegular />}
          disabled={!hasCopied}
          onClick={() => run(pasteSizeOnly, "Size applied")}
        >
          Paste Size
        </Button>
      </Tooltip>
      <Tooltip content="Match both position and size of copied shape" relationship="description">
        <Button
          size="small"
          icon={<ResizeRegular />}
          disabled={!hasCopied}
          onClick={() => run(pasteSize, "Position + size applied")}
        >
          Paste All
        </Button>
      </Tooltip>
    </div>
  );
};

export default PositionTools;
