import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../theme/tokens";
import { TabArrangeIcon, TabElementsIcon, TabExportIcon, TabLibraryIcon } from "./primitives/icons";

export type TabKey = "arrange" | "elements" | "library" | "finalize";

const useStyles = makeStyles({
  root: {
    display: "flex",
    gap: "10px",
    padding: "0 16px",
    borderBottom: `1px solid ${tokens.border}`,
  },
  tab: {
    flex: 1,
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "12.5px",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    marginBottom: "-1px",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    padding: 0,
    ":hover": {
      color: tokens.textStrong,
    },
  },
  icon: {
    display: "grid",
    placeItems: "center",
    width: "15px",
    height: "15px",
  },
});

const TABS: { key: TabKey; label: string; icon: React.FC }[] = [
  { key: "library", label: "Library", icon: TabLibraryIcon },
  { key: "arrange", label: "Arrange", icon: TabArrangeIcon },
  { key: "elements", label: "Elements", icon: TabElementsIcon },
  { key: "finalize", label: "Finalize", icon: TabExportIcon },
];

const TabBar: React.FC<{ active: TabKey; onChange: (tab: TabKey) => void }> = ({ active, onChange }) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            className={styles.tab}
            style={{
              borderBottomColor: isActive ? tokens.accent : "transparent",
              color: isActive ? tokens.textStrong : tokens.textMuted,
              fontWeight: isActive ? 600 : 400,
            }}
            onClick={() => onChange(key)}
          >
            <span className={styles.icon}>
              <Icon />
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;
