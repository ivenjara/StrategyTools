import * as React from "react";
import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Checkbox,
  RadioGroup,
  Radio,
  makeStyles,
  Spinner,
  Label,
  tokens,
} from "@fluentui/react-components";
import { ArrowDownloadRegular, MailRegular } from "@fluentui/react-icons";
import {
  getPresentationName,
  formatFileName,
  getFullPresentation,
  getSelectedSlidesPresentation,
  getSelectedSlideInfo,
  triggerDownload,
  composeEmail,
} from "../../core/saveAndSend";

interface SaveSendToolsProps {
  onStatus: (message: string, type: "success" | "error" | "info") => void;
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
    marginTop: "4px",
  },
  label: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
  },
});

const SaveSendTools: React.FC<SaveSendToolsProps> = ({ onStatus }) => {
  const styles = useStyles();
  const [fileName, setFileName] = useState("Presentation");
  const [includeDateTime, setIncludeDateTime] = useState(false);
  const [scope, setScope] = useState<"entire" | "selected">("entire");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setFileName(getPresentationName());
  }, []);

  /** Download either the full deck or just selected slides. */
  const handleDownload = async () => {
    setIsBusy(true);
    try {
      if (scope === "selected") {
        const info = await getSelectedSlideInfo();
        const finalName = formatFileName(fileName, includeDateTime, info.slideSuffix);
        const blob = await getSelectedSlidesPresentation(info.slideIds);
        triggerDownload(blob, finalName);
        onStatus(`Downloaded ${finalName}`, "success");
      } else {
        const finalName = formatFileName(fileName, includeDateTime);
        const blob = await getFullPresentation();
        triggerDownload(blob, finalName);
        onStatus(`Downloaded ${finalName}`, "success");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Download failed";
      onStatus(message, "error");
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
      let finalName: string;

      if (scope === "selected") {
        const info = await getSelectedSlideInfo();
        finalName = formatFileName(fileName, includeDateTime, info.slideSuffix);
        const blob = await getSelectedSlidesPresentation(info.slideIds);
        triggerDownload(blob, finalName);
      } else {
        finalName = formatFileName(fileName, includeDateTime);
        const blob = await getFullPresentation();
        triggerDownload(blob, finalName);
      }

      // Brief delay so the download starts before the email client opens
      await new Promise((resolve) => setTimeout(resolve, 500));
      composeEmail(finalName);
      onStatus("File downloaded — attach it to the email", "info");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to compose email";
      onStatus(message, "error");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <Label className={styles.label} htmlFor="fileName">
          File name
        </Label>
        <Input
          id="fileName"
          size="small"
          value={fileName}
          onChange={(_e, data) => setFileName(data.value)}
          style={{ width: "100%" }}
        />
      </div>

      <Checkbox
        size="medium"
        label="Include date and time"
        checked={includeDateTime}
        onChange={(_e, data) => setIncludeDateTime(!!data.checked)}
      />

      <RadioGroup
        value={scope}
        onChange={(_e, data) => setScope(data.value as "entire" | "selected")}
      >
        <Radio value="entire" label="Entire presentation" />
        <Radio value="selected" label="Selected slides" />
      </RadioGroup>

      <div className={styles.buttonGrid}>
        <Button
          size="small"
          icon={isBusy ? <Spinner size="tiny" /> : <ArrowDownloadRegular />}
          onClick={handleDownload}
          disabled={isBusy}
        >
          {isBusy ? "Saving..." : "Download"}
        </Button>
        <Button
          size="small"
          icon={<MailRegular />}
          onClick={handleComposeEmail}
          disabled={isBusy}
        >
          Compose Email
        </Button>
      </div>
    </div>
  );
};

export default SaveSendTools;
