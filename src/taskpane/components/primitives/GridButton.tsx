import * as React from "react";
import { makeStyles, mergeClasses, shorthands } from "@griffel/react";
import { tokens } from "../../theme/tokens";

const useStyles = makeStyles({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.card,
    border: `1px solid ${tokens.borderControl}`,
    borderRadius: tokens.radiusButton,
    cursor: "pointer",
    color: tokens.textSecondary,
    padding: 0,
    fontFamily: "inherit",
    ":hover": {
      ...shorthands.borderColor(tokens.accent),
      color: tokens.textStrong,
      backgroundColor: tokens.cardHover,
    },
    ":active": {
      backgroundColor: tokens.cardActive,
    },
  },
  column: {
    flexDirection: "column",
    gap: "4px",
  },
  row: {
    gap: "6px",
  },
  selected: {
    backgroundColor: tokens.emphBg,
    ...shorthands.borderColor(tokens.accent),
    ":hover": {
      backgroundColor: tokens.cardHover,
      ...shorthands.borderColor(tokens.accent),
    },
  },
  disabled: {
    cursor: "default",
    color: tokens.textDisabled,
    ":hover": {
      ...shorthands.borderColor(tokens.borderControl),
      color: tokens.textDisabled,
      backgroundColor: tokens.card,
    },
    ":active": {
      backgroundColor: tokens.card,
    },
  },
});

interface GridButtonProps {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  height: number;
  layout?: "row" | "column";
  selected?: boolean;
  fontSize?: string;
  fontWeight?: number;
  gap?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/** Card-style button used across all grids (align, swap, tiles, chips). */
const GridButton: React.FC<GridButtonProps> = ({
  title,
  onClick,
  disabled,
  height,
  layout = "row",
  selected,
  fontSize = "12.5px",
  fontWeight = 500,
  gap,
  style,
  children,
}) => {
  const styles = useStyles();
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={mergeClasses(
        styles.base,
        layout === "column" ? styles.column : styles.row,
        selected && styles.selected,
        disabled && styles.disabled
      )}
      style={{ height: `${height}px`, fontSize, fontWeight, ...(gap ? { gap } : {}), ...style }}
    >
      {children}
    </button>
  );
};

export default GridButton;
