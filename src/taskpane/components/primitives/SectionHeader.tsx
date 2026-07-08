import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";

const useStyles = makeStyles({
  row: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  label: {
    fontSize: "12.5px",
    fontWeight: 700,
    letterSpacing: "0.6px",
    color: tokens.textSecondary,
    textTransform: "uppercase",
  },
  right: {
    fontSize: "11px",
  },
});

interface SectionHeaderProps {
  label: string;
  /** Right-aligned hint or status text (e.g. "to last-selected shape", "Copied ✓") */
  right?: string;
  rightColor?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ label, right, rightColor }) => {
  const styles = useStyles();
  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      {right !== undefined && (
        <div className={styles.right} style={{ color: rightColor ?? tokens.textDisabled }}>
          {right}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
