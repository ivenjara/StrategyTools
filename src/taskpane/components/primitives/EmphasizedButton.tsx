import * as React from "react";
import { makeStyles, mergeClasses, shorthands } from "@griffel/react";
import { tokens } from "../../theme/tokens";

const useStyles = makeStyles({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: tokens.emphBg,
    border: `1px solid ${tokens.emphBorder}`,
    borderRadius: tokens.radiusButton,
    cursor: "pointer",
    color: tokens.textPrimary,
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "inherit",
    width: "100%",
    ":hover": {
      ...shorthands.borderColor(tokens.accent),
      backgroundColor: tokens.emphHover,
    },
  },
  disabled: {
    cursor: "default",
    color: tokens.textDisabled,
    ":hover": {
      ...shorthands.borderColor(tokens.emphBorder),
      backgroundColor: tokens.emphBg,
    },
  },
});

interface EmphasizedButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  height?: number;
  title?: string;
  children: React.ReactNode;
}

/** Full-width emphasized action button (Copy, Apply, Convert). */
const EmphasizedButton: React.FC<EmphasizedButtonProps> = ({ onClick, disabled, height = 36, title, children }) => {
  const styles = useStyles();
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={mergeClasses(styles.base, disabled && styles.disabled)}
      style={{ height: `${height}px` }}
    >
      {children}
    </button>
  );
};

export default EmphasizedButton;
