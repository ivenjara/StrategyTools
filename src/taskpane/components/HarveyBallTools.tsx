import * as React from "react";
import { Button, makeStyles, Tooltip } from "@fluentui/react-components";
import { insertHarveyBall, HarveyBallLevel } from "../../core/harveyBallOperations";

interface HarveyBallToolsProps {
  onStatus: (message: string, type: "success" | "error" | "info") => void;
}

const HarveyBallIcon: React.FC<{ level: HarveyBallLevel }> = ({ level }) => {
  const circle = (
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
  );
  let fill: React.ReactNode = null;

  if (level === 100) {
    fill = <circle cx="12" cy="12" r="10" fill="currentColor" />;
  } else if (level === 25) {
    fill = <path d="M12,12 L12,2 A10,10 0 0,1 22,12 Z" fill="currentColor" />;
  } else if (level === 50) {
    fill = <path d="M12,12 L12,2 A10,10 0 1,1 12,22 Z" fill="currentColor" />;
  } else if (level === 75) {
    fill = <path d="M12,12 L12,2 A10,10 0 1,1 2,12 Z" fill="currentColor" />;
  }

  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {circle}
      {fill}
    </svg>
  );
};

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
    gap: "6px",
  },
});

const levels: { level: HarveyBallLevel; tooltip: string }[] = [
  { level: 0, tooltip: "Insert empty Harvey ball (0%)" },
  { level: 25, tooltip: "Insert quarter Harvey ball (25%)" },
  { level: 50, tooltip: "Insert half Harvey ball (50%)" },
  { level: 75, tooltip: "Insert three-quarter Harvey ball (75%)" },
  { level: 100, tooltip: "Insert full Harvey ball (100%)" },
];

const HarveyBallTools: React.FC<HarveyBallToolsProps> = ({ onStatus }) => {
  const styles = useStyles();

  const run = async (level: HarveyBallLevel) => {
    try {
      await insertHarveyBall(level);
      onStatus(`Inserted ${level}% Harvey ball`, "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      onStatus(message, "error");
    }
  };

  return (
    <div className={styles.grid}>
      {levels.map(({ level, tooltip }) => (
        <Tooltip key={level} content={tooltip} relationship="description">
          <Button
            size="small"
            appearance="subtle"
            icon={<HarveyBallIcon level={level} />}
            onClick={() => run(level)}
          />
        </Tooltip>
      ))}
    </div>
  );
};

export default HarveyBallTools;
