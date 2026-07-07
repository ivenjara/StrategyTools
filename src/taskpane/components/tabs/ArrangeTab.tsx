import * as React from "react";
import { makeStyles } from "@griffel/react";
import AlignDistributeSection from "../sections/AlignDistributeSection";
import MatchSizeSection from "../sections/MatchSizeSection";
import MakeSameSection from "../sections/MakeSameSection";
import TextMarginsSection from "../sections/TextMarginsSection";
import SwapSection from "../sections/SwapSection";
import PositionClipboardSection from "../sections/PositionClipboardSection";
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

const ArrangeTab: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <AlignDistributeSection onError={onError} />
      <MatchSizeSection onError={onError} />
      <MakeSameSection onError={onError} />
      <TextMarginsSection onError={onError} />
      <SwapSection onError={onError} />
      <PositionClipboardSection onError={onError} />
    </div>
  );
};

export default ArrangeTab;
