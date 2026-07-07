import * as React from "react";
import { makeStyles, mergeClasses } from "@griffel/react";
import { tokens } from "../../theme/tokens";

const useStyles = makeStyles({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    backgroundColor: tokens.accent,
    border: `1px solid ${tokens.accent}`,
    borderRadius: tokens.radiusButton,
    cursor: "pointer",
    color: tokens.paneBg,
    fontSize: "13px",
    fontWeight: 700,
    fontFamily: "inherit",
    height: "38px",
    ":hover": {
      backgroundColor: tokens.accentHover,
    },
  },
  disabled: {
    cursor: "default",
    opacity: 0.6,
    ":hover": {
      backgroundColor: tokens.accent,
    },
  },
});

interface PrimaryButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

/** Accent-filled primary button (Download). */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({ onClick, disabled, title, children }) => {
  const styles = useStyles();
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={mergeClasses(styles.base, disabled && styles.disabled)}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
