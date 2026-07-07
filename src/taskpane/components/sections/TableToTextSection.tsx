import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import EmphasizedButton from "../primitives/EmphasizedButton";
import SegmentedControl from "../primitives/SegmentedControl";
import { Select } from "../primitives/fields";
import { TableConvertIcon } from "../primitives/icons";
import { convertTableToText, TableTextMode, SeparatorKey } from "../../../core/tableToText";
import { OnError } from "../App";

const useStyles = makeStyles({
  column: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  separatorRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  separatorLabel: {
    fontSize: "12px",
    color: tokens.textMuted,
    whiteSpace: "nowrap",
  },
  status: {
    fontSize: "11px",
    minHeight: "14px",
  },
});

const SEPARATOR_OPTIONS: { value: SeparatorKey; label: string }[] = [
  { value: "tab", label: "Tab" },
  { value: "space", label: "Space" },
  { value: "comma", label: "Comma" },
  { value: "semicolon", label: "Semicolon" },
  { value: "pipe", label: "Pipe |" },
  { value: "newline", label: "New line" },
];

const TableToTextSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [mode, setMode] = useState<TableTextMode>("cells");
  const [separator, setSeparator] = useState<SeparatorKey>("tab");
  const [converted, setConverted] = useState(false);

  const convert = async () => {
    try {
      await convertTableToText(mode, separator);
      setConverted(true);
    } catch (err: unknown) {
      setConverted(false);
      onError(err instanceof Error ? err.message : "Table conversion failed");
    }
  };

  return (
    <div>
      <SectionHeader label="Convert Table to Text" />
      <div className={styles.column}>
        <SegmentedControl
          fontSize="12px"
          options={[
            { value: "cells", label: "Text box per cell" },
            { value: "single", label: "Single text box" },
          ]}
          value={mode}
          onChange={(value) => {
            setMode(value);
            setConverted(false);
          }}
        />
        {mode === "single" && (
          <div className={styles.separatorRow}>
            <label className={styles.separatorLabel} htmlFor="ns-separator">
              Separate cells with
            </label>
            <Select
              id="ns-separator"
              value={separator}
              onChange={(value) => {
                setSeparator(value as SeparatorKey);
                setConverted(false);
              }}
              options={SEPARATOR_OPTIONS}
            />
          </div>
        )}
        <EmphasizedButton height={36} onClick={convert}>
          <TableConvertIcon />
          {mode === "cells" ? "Convert to text boxes" : "Convert to one text box"}
        </EmphasizedButton>
        <div
          className={styles.status}
          style={{ color: converted ? tokens.success : tokens.textDisabled }}
        >
          {converted ? "Table converted ✓" : "Select a table first."}
        </div>
      </div>
    </div>
  );
};

export default TableToTextSection;
