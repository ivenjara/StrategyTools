import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../theme/tokens";

const useStyles = makeStyles({
  root: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "9px 16px",
    backgroundColor: tokens.card,
    borderTop: `1px solid ${tokens.border}`,
    color: tokens.danger,
    fontSize: "12px",
    fontWeight: 500,
    textAlign: "center",
  },
});

/** Fixed bottom bar shown only when an operation fails. */
const ErrorBar: React.FC<{ error: string | null }> = ({ error }) => {
  const styles = useStyles();
  if (!error) return null;
  return <div className={styles.root}>{error}</div>;
};

export default ErrorBar;
