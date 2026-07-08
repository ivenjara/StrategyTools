import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import HarveyBallSection from "../sections/HarveyBallSection";
import TableTextSection from "../sections/TableTextSection";
import TableToolsSection from "../sections/TableToolsSection";
import { OnError } from "../App";

const useStyles = makeStyles({
  root: {
    flex: 1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    "& > div + div": {
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderTopColor: tokens.borderControl,
      paddingTop: "14px",
    },
  },
});

const ElementsTab: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <HarveyBallSection onError={onError} />
      <TableTextSection onError={onError} />
      <TableToolsSection onError={onError} />
    </div>
  );
};

export default ElementsTab;
