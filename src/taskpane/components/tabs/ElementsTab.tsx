import * as React from "react";
import { makeStyles } from "@griffel/react";
import HarveyBallSection from "../sections/HarveyBallSection";
import StatusStampsSection from "../sections/StatusStampsSection";
import TableToTextSection from "../sections/TableToTextSection";
import { OnError } from "../App";

const useStyles = makeStyles({
  root: {
    flex: 1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
});

const ElementsTab: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <HarveyBallSection onError={onError} />
      <StatusStampsSection onError={onError} />
      <TableToTextSection onError={onError} />
    </div>
  );
};

export default ElementsTab;
