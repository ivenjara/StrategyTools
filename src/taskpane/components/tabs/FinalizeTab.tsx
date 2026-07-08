import * as React from "react";
import { useEffect, useState } from "react";
import { makeStyles, shorthands } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import PrimaryButton from "../primitives/PrimaryButton";
import SegmentedControl from "../primitives/SegmentedControl";
import StatusStampsSection from "../sections/StatusStampsSection";
import FontConsistencySection from "../sections/FontConsistencySection";
import { TextField, Checkbox } from "../primitives/fields";
import { DownloadIcon, EnvelopeIcon } from "../primitives/icons";
import {
  getPresentationName,
  formatFileName,
  getFullPresentation,
  getSelectedSlidesPresentation,
  getSelectedSlideInfo,
  triggerDownload,
  composeEmail,
} from "../../../core/saveAndSend";
import { useTransientStatus } from "../useTransientStatus";
import { OnError } from "../App";

const useStyles = makeStyles({
  root: {
    flex: 1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  exportControls: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  buttonRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "4px",
  },
  emailButton: {
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    backgroundColor: tokens.card,
    border: `1px solid ${tokens.emphBorder}`,
    borderRadius: tokens.radiusButton,
    cursor: "pointer",
    color: tokens.textPrimary,
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "inherit",
    ":hover": {
      ...shorthands.borderColor(tokens.accent),
      backgroundColor: tokens.cardHover,
    },
    ":disabled": {
      color: tokens.textDisabled,
      cursor: "default",
    },
  },
  status: {
    fontSize: "11px",
    minHeight: "14px",
  },
});

const FinalizeTab: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [fileName, setFileName] = useState("Presentation");
  const [includeDateTime, setIncludeDateTime] = useState(false);
  const [scope, setScope] = useState<"entire" | "selected">("entire");
  const [isBusy, setIsBusy] = useState(false);
  const [status, showStatus] = useTransientStatus(4000);

  useEffect(() => {
    setFileName(getPresentationName());
  }, []);

  /** Builds the final file name and blob for the current scope, then downloads it. */
  const downloadCurrentScope = async (): Promise<string> => {
    if (scope === "selected") {
      const info = await getSelectedSlideInfo();
      const finalName = formatFileName(fileName, includeDateTime, info.slideSuffix);
      const blob = await getSelectedSlidesPresentation(info.slideIds);
      triggerDownload(blob, finalName);
      return finalName;
    }
    const finalName = formatFileName(fileName, includeDateTime);
    const blob = await getFullPresentation();
    triggerDownload(blob, finalName);
    return finalName;
  };

  const handleDownload = async () => {
    setIsBusy(true);
    try {
      const finalName = await downloadCurrentScope();
      showStatus(`Downloaded ${finalName} ✓`);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setIsBusy(false);
    }
  };

  /**
   * Compose email: downloads the file first (so the user can attach it),
   * then opens the email client with a pre-filled subject and body.
   */
  const handleComposeEmail = async () => {
    setIsBusy(true);
    try {
      const finalName = await downloadCurrentScope();
      // Brief delay so the download starts before the email client opens
      await new Promise((resolve) => setTimeout(resolve, 500));
      composeEmail(finalName);
      showStatus("File downloaded — attach it to the email");
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Failed to compose email");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className={styles.root}>
      <StatusStampsSection onError={onError} />
      <FontConsistencySection onError={onError} />
      <div>
        <SectionHeader label="Export" />
        <div className={styles.exportControls}>
          <TextField id="ns-filename" label="File name" value={fileName} onChange={setFileName} />
          <Checkbox label="Include date and time" checked={includeDateTime} onChange={setIncludeDateTime} />
          <SegmentedControl
            options={[
              { value: "entire", label: "Entire presentation" },
              { value: "selected", label: "Selected slides" },
            ]}
            value={scope}
            onChange={setScope}
          />
          <div className={styles.buttonRow}>
            <PrimaryButton onClick={handleDownload} disabled={isBusy} title="Download presentation">
              <DownloadIcon />
              {isBusy ? "Saving..." : "Download"}
            </PrimaryButton>
            <button
              type="button"
              className={styles.emailButton}
              onClick={handleComposeEmail}
              disabled={isBusy}
              title="Download and compose email"
            >
              <EnvelopeIcon />
              Email
            </button>
          </div>
          <div className={styles.status} style={{ color: tokens.success }}>
            {status ?? ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalizeTab;
