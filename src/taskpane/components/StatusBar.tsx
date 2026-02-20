import * as React from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import type { StatusType } from "./App";

interface StatusBarProps {
  status: StatusType;
}

const useStyles = makeStyles({
  bar: {
    position: "fixed",
    bottom: "0",
    left: "0",
    right: "0",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: "500",
    textAlign: "center",
    transition: "opacity 0.3s ease",
  },
  success: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
  },
  error: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1,
  },
  info: {
    backgroundColor: tokens.colorPaletteBlueBorderActive,
    color: tokens.colorNeutralForegroundOnBrand,
  },
});

const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  const styles = useStyles();

  if (!status) return null;

  const typeClass =
    status.type === "success"
      ? styles.success
      : status.type === "error"
        ? styles.error
        : styles.info;

  return (
    <div className={`${styles.bar} ${typeClass}`}>
      {status.message}
    </div>
  );
};

export default StatusBar;
