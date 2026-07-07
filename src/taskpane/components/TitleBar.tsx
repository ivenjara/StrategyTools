/* global Office */

import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../theme/tokens";
import { MoonLogoIcon, CloseIcon } from "./primitives/icons";

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px 10px 16px",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },
  logoTile: {
    display: "grid",
    placeItems: "center",
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    backgroundColor: tokens.emphBg,
  },
  title: {
    fontSize: "15px",
    fontWeight: 700,
    letterSpacing: "0.2px",
    color: tokens.textPrimary,
  },
  badge: {
    fontSize: "9.5px",
    fontWeight: 700,
    letterSpacing: "0.7px",
    color: tokens.paneBg,
    backgroundColor: tokens.accent,
    padding: "2px 6px",
    borderRadius: "3px",
  },
  close: {
    width: "28px",
    height: "28px",
    display: "grid",
    placeItems: "center",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    color: tokens.textMuted,
    padding: 0,
    ":hover": {
      backgroundColor: tokens.hoverGhost,
      color: tokens.textPrimary,
    },
  },
});

const TitleBar: React.FC = () => {
  const styles = useStyles();
  // Office.addin.hide() is only available with a shared runtime; hide the button otherwise.
  const canClose = typeof Office !== "undefined" && !!Office.addin && typeof Office.addin.hide === "function";

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <span className={styles.logoTile}>
          <MoonLogoIcon />
        </span>
        <span className={styles.title}>Nightshift</span>
        <span className={styles.badge}>MVP</span>
      </div>
      {canClose && (
        <button type="button" title="Close pane" className={styles.close} onClick={() => Office.addin.hide()}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export default TitleBar;
