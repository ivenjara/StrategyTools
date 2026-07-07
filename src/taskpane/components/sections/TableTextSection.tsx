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
import { convertTextToTable, SplitSeparatorKey } from "../../../core/textToTable";
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

type Direction = "toText" | "toTable";

const SEPARATOR_OPTIONS: { value: SeparatorKey; label: string }[] = [
  { value: "tab", label: "Tab" },
  { value: "space", label: "Space" },
  { value: "comma", label: "Comma" },
  { value: "semicolon", label: "Semicolon" },
  { value: "pipe", label: "Pipe |" },
  { value: "newline", label: "New line" },
];

// "New line" can't split cells in text → table: lines are rows.
const SPLIT_SEPARATOR_OPTIONS = SEPARATOR_OPTIONS.filter((o) => o.value !== "newline");

const IDLE_STATUS: Record<Direction, string> = {
  toText: "Select a table first.",
  toTable: "Select 1 text box to split its lines, or several to arrange into a grid.",
};

const TableTextSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [direction, setDirection] = useState<Direction>("toText");
  const [tableMode, setTableMode] = useState<TableTextMode>("cells");
  const [separator, setSeparator] = useState<SeparatorKey>("tab");
  const [splitSeparator, setSplitSeparator] = useState<SplitSeparatorKey>("tab");
  const [statusText, setStatusText] = useState<string | null>(null);

  const convert = async () => {
    try {
      if (direction === "toText") {
        await convertTableToText(tableMode, separator);
        setStatusText("Table converted ✓");
      } else {
        const result = await convertTextToTable(splitSeparator);
        setStatusText(`Created ${result.rowCount}×${result.columnCount} table ✓`);
      }
    } catch (err: unknown) {
      setStatusText(null);
      onError(err instanceof Error ? err.message : "Conversion failed");
    }
  };

  return (
    <div>
      <SectionHeader label="Convert Table ⇄ Text" />
      <div className={styles.column}>
        <SegmentedControl
          fontSize="12px"
          options={[
            { value: "toText", label: "Table → Text" },
            { value: "toTable", label: "Text → Table" },
          ]}
          value={direction}
          onChange={(value) => {
            setDirection(value);
            setStatusText(null);
          }}
        />
        {direction === "toText" && (
          <SegmentedControl
            fontSize="12px"
            options={[
              { value: "cells", label: "Text box per cell" },
              { value: "single", label: "Single text box" },
            ]}
            value={tableMode}
            onChange={(value) => {
              setTableMode(value);
              setStatusText(null);
            }}
          />
        )}
        {direction === "toText" && tableMode === "single" && (
          <div className={styles.separatorRow}>
            <label className={styles.separatorLabel} htmlFor="ns-separator">
              Separate cells with
            </label>
            <Select
              id="ns-separator"
              value={separator}
              onChange={(value) => {
                setSeparator(value as SeparatorKey);
                setStatusText(null);
              }}
              options={SEPARATOR_OPTIONS}
            />
          </div>
        )}
        {direction === "toTable" && (
          <div className={styles.separatorRow}>
            <label className={styles.separatorLabel} htmlFor="ns-split-separator">
              Split cells by
            </label>
            <Select
              id="ns-split-separator"
              value={splitSeparator}
              onChange={(value) => {
                setSplitSeparator(value as SplitSeparatorKey);
                setStatusText(null);
              }}
              options={SPLIT_SEPARATOR_OPTIONS}
            />
          </div>
        )}
        <EmphasizedButton height={36} onClick={convert}>
          <TableConvertIcon />
          {direction === "toTable"
            ? "Convert to table"
            : tableMode === "cells"
              ? "Convert to text boxes"
              : "Convert to one text box"}
        </EmphasizedButton>
        <div className={styles.status} style={{ color: statusText ? tokens.success : tokens.textDisabled }}>
          {statusText ?? IDLE_STATUS[direction]}
        </div>
      </div>
    </div>
  );
};

export default TableTextSection;
