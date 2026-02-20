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
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setFileName(getPresentationName());
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const finalName = formatFileName(fileName, includeDateTime);
      const blob =
        scope === "selected"
          ? await getSelectedSlidesPresentation()
          : await getFullPresentation();
      triggerDownload(blob, finalName);
      onStatus(`Downloaded ${finalName}`, "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Download failed";
      onStatus(message, "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleComposeEmail = () => {
    try {
      const finalName = formatFileName(fileName, includeDateTime);
      composeEmail(finalName);
      onStatus("Opening email client...", "info");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to open email";
      onStatus(message, "error");
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
          icon={isDownloading ? <Spinner size="tiny" /> : <ArrowDownloadRegular />}
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? "Saving..." : "Download"}
        </Button>
        <Button
          size="small"
          icon={<MailRegular />}
          onClick={handleComposeEmail}
        >
          Compose Email
        </Button>
      </div>
    </div>
  );
};

export default SaveSendTools;
