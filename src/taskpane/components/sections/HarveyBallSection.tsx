import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import GridButton from "../primitives/GridButton";
import { HarveyBallIcon } from "../primitives/icons";
import { insertHarveyBall, HarveyBallLevel } from "../../../core/harveyBallOperations";
import { OnError } from "../App";

const useStyles = makeStyles({
  row: {
    display: "flex",
    gap: "6px",
  },
  helper: {
    fontSize: "11.5px",
    color: tokens.textFaint,
    marginTop: "8px",
  },
});

const LEVELS: { fill: 0 | 1 | 2 | 3 | 4; level: HarveyBallLevel; label: string }[] = [
  { fill: 0, level: 0, label: "Empty (0%)" },
  { fill: 1, level: 25, label: "Quarter (25%)" },
  { fill: 2, level: 50, label: "Half (50%)" },
  { fill: 3, level: 75, label: "Three-quarter (75%)" },
  { fill: 4, level: 100, label: "Full (100%)" },
];

const HarveyBallSection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [selected, setSelected] = useState<number | null>(null);

  const insert = async (fill: number, level: HarveyBallLevel) => {
    setSelected(fill);
    try {
      await insertHarveyBall(level);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Harvey ball insertion failed");
    }
  };

  return (
    <div>
      <SectionHeader label="Harvey Balls" />
      <div className={styles.row}>
        {LEVELS.map(({ fill, level, label }) => (
          <GridButton
            key={fill}
            title={label}
            height={44}
            selected={selected === fill}
            onClick={() => insert(fill, level)}
            style={{ flex: 1 }}
          >
            <HarveyBallIcon fill={fill} selected={selected === fill} />
          </GridButton>
        ))}
      </div>
      <div className={styles.helper}>Click to insert at the current cursor position.</div>
    </div>
  );
};

export default HarveyBallSection;
