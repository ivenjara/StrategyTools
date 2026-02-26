import * as React from "react";
import { useState } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import Header from "./Header";
import SwapTools from "./SwapTools";
import AlignTools from "./AlignTools";
import DistributeTools from "./DistributeTools";
import PositionTools from "./PositionTools";
import HarveyBallTools from "./HarveyBallTools";
import SaveSendTools from "./SaveSendTools";
import StatusBar from "./StatusBar";

interface AppProps {
  title: string;
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
    padding: "12px",
  },
  section: {
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: tokens.colorNeutralForeground3,
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
});

export type StatusType = { message: string; type: "success" | "error" | "info" } | null;

const App: React.FC<AppProps> = ({ title }) => {
  const styles = useStyles();
  const [status, setStatus] = useState<StatusType>(null);

  const handleStatus = (message: string, type: "success" | "error" | "info") => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className={styles.root}>
      <Header title={title} />
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Swap Positions</div>
        <SwapTools onStatus={handleStatus} />
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Align</div>
        <AlignTools onStatus={handleStatus} />
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Distribute</div>
        <DistributeTools onStatus={handleStatus} />
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Position</div>
        <PositionTools onStatus={handleStatus} />
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Harvey Balls</div>
        <HarveyBallTools onStatus={handleStatus} />
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Save & Send</div>
        <SaveSendTools onStatus={handleStatus} />
      </div>
      <StatusBar status={status} />
    </div>
  );
};

export default App;
