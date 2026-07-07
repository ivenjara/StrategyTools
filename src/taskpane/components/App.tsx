import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../theme/tokens";
import TitleBar from "./TitleBar";
import TabBar, { TabKey } from "./TabBar";
import ErrorBar from "./ErrorBar";
import ArrangeTab from "./tabs/ArrangeTab";
import ElementsTab from "./tabs/ElementsTab";
import ExportTab from "./tabs/ExportTab";

const useStyles = makeStyles({
  root: {
    maxWidth: "360px",
    minHeight: "100vh",
    margin: "0 auto",
    backgroundColor: tokens.paneBg,
    borderLeft: `1px solid ${tokens.border}`,
    borderRight: `1px solid ${tokens.border}`,
    display: "flex",
    flexDirection: "column",
    color: tokens.textPrimary,
  },
});

export type OnError = (message: string) => void;

const App: React.FC = () => {
  const styles = useStyles();
  const [tab, setTab] = useState<TabKey>("arrange");
  const [error, setError] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onError = useCallback<OnError>((message) => {
    // eslint-disable-next-line no-console
    console.error("[Nightshift]", message);
    // Host errors occasionally arrive with an empty message; an empty
    // string would hide the ErrorBar entirely.
    setError(message.trim() ? message : "Operation failed — try again with a smaller selection.");
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setError(null), 4000);
  }, []);

  // Keep all tabs mounted so field state (margins, export options) survives tab switches.
  const tabStyle = (key: TabKey): React.CSSProperties => ({
    display: tab === key ? "flex" : "none",
    flex: 1,
    flexDirection: "column",
  });

  return (
    <div className={styles.root}>
      <TitleBar />
      <TabBar active={tab} onChange={setTab} />
      <div style={tabStyle("arrange")}>
        <ArrangeTab onError={onError} />
      </div>
      <div style={tabStyle("elements")}>
        <ElementsTab onError={onError} />
      </div>
      <div style={tabStyle("export")}>
        <ExportTab onError={onError} />
      </div>
      <ErrorBar error={error} />
    </div>
  );
};

export default App;
