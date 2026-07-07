import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import GridButton from "../primitives/GridButton";
import EmphasizedButton from "../primitives/EmphasizedButton";
import { CopyIcon } from "../primitives/icons";
import {
  copyPosition,
  pastePosition,
  pasteSize,
  pasteSizeOnly,
  hasPosition,
} from "../../../core/positionClipboard";
import { OnError } from "../App";

const useStyles = makeStyles({
  column: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  pasteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "6px",
  },
});

const PASTE_BUTTONS: { short: string; label: string; fn: () => Promise<void> }[] = [
  { short: "Paste Pos", label: "Paste position", fn: pastePosition },
  { short: "Paste Size", label: "Paste size", fn: pasteSizeOnly },
  { short: "Paste All", label: "Paste position and size", fn: pasteSize },
];

const PositionClipboardSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [copied, setCopied] = useState(hasPosition());

  const copy = async () => {
    try {
      await copyPosition();
      setCopied(true);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Copy failed");
    }
  };

  const paste = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Paste failed");
    }
  };

  return (
    <div>
      <SectionHeader
        label="Position Clipboard"
        right={copied ? "Copied ✓" : "Nothing copied"}
        rightColor={copied ? tokens.success : tokens.textDisabled}
      />
      <div className={styles.column}>
        <EmphasizedButton height={38} onClick={copy}>
          <CopyIcon />
          Copy position &amp; size
        </EmphasizedButton>
        <div className={styles.pasteGrid}>
          {PASTE_BUTTONS.map(({ short, label, fn }) => (
            <GridButton
              key={short}
              title={label}
              height={34}
              fontSize="12px"
              disabled={!copied}
              onClick={() => paste(fn)}
            >
              <span>{short}</span>
            </GridButton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PositionClipboardSection;
