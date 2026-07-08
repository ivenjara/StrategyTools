import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";

const useStyles = makeStyles({
  track: {
    height: "4px",
    backgroundColor: tokens.inputBg,
    border: `1px solid ${tokens.borderControl}`,
    borderRadius: "2px",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: tokens.accent,
    transitionProperty: "width",
    transitionDuration: "200ms",
  },
});

/** Thin accent progress bar; fraction in [0, 1]. */
const ProgressBar: React.FC<{ fraction: number }> = ({ fraction }) => {
  const styles = useStyles();
  return (
    <div className={styles.track}>
      <div className={styles.fill} style={{ width: `${Math.round(Math.min(1, Math.max(0, fraction)) * 100)}%` }} />
    </div>
  );
};

export default ProgressBar;
