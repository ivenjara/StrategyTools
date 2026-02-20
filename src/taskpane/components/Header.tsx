import * as React from "react";
import { makeStyles, tokens } from "@fluentui/react-components";

interface HeaderProps {
  title: string;
}

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  title: {
    fontSize: "16px",
    fontWeight: "700",
    color: tokens.colorNeutralForeground1,
    margin: 0,
  },
  badge: {
    fontSize: "10px",
    fontWeight: "600",
    color: tokens.colorNeutralForegroundOnBrand,
    backgroundColor: "#181824",
    padding: "2px 6px",
    borderRadius: "4px",
  },
});

const Header: React.FC<HeaderProps> = ({ title }) => {
  const styles = useStyles();
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <span className={styles.badge}>MVP</span>
    </div>
  );
};

export default Header;
