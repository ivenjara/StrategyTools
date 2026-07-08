/* global Office */

import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens, ThemeName } from "../theme/tokens";
import { MoonGlyph, SunGlyph, CloseIcon } from "./primitives/icons";

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
    color: tokens.accent,
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
  right: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
  },
  ghostButton: {
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

interface TitleBarProps {
  theme: ThemeName;
  onToggleTheme: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ theme, onToggleTheme }) => {
  const styles = useStyles();
  const isDark = theme === "dark";
  // Office.addin.hide() is only available with a shared runtime; hide the button otherwise.
  const canClose = typeof Office !== "undefined" && !!Office.addin && typeof Office.addin.hide === "function";

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <span className={styles.logoTile}>{isDark ? <MoonGlyph /> : <SunGlyph />}</span>
        <span className={styles.title}>{isDark ? "Nightshift" : "Dayshift"}</span>
        <span className={styles.badge}>MVP</span>
      </div>
      <div className={styles.right}>
        <button
          type="button"
          title={isDark ? "Switch to Dayshift (light mode)" : "Switch to Nightshift (dark mode)"}
          className={styles.ghostButton}
          onClick={onToggleTheme}
        >
          {isDark ? <SunGlyph size={14} /> : <MoonGlyph size={14} />}
        </button>
        {canClose && (
          <button type="button" title="Close pane" className={styles.ghostButton} onClick={() => Office.addin.hide()}>
            <CloseIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default TitleBar;
