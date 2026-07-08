import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import EmphasizedButton from "../primitives/EmphasizedButton";
import ProgressBar from "../primitives/ProgressBar";
import { TextField } from "../primitives/fields";
import { scanFonts, applyFontEverywhere, FontScanResult } from "../../../core/fontConsistency";
import { useTransientStatus } from "../useTransientStatus";
import { OnError } from "../App";

const FONT_DATALIST_ID = "ns-font-options";

const useStyles = makeStyles({
  column: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fontList: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    padding: "8px 10px",
    backgroundColor: tokens.inputBg,
    border: `1px solid ${tokens.borderControl}`,
    borderRadius: tokens.radiusInput,
  },
  fontRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    fontSize: "12.5px",
    color: tokens.textSecondary,
  },
  fontCount: {
    fontSize: "11px",
    color: tokens.textMuted,
  },
  mixedNote: {
    fontSize: "11px",
    color: tokens.warn,
    marginTop: "2px",
  },
  helper: {
    fontSize: "11.5px",
    color: tokens.textFaint,
  },
});

const FontConsistencySection: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [scan, setScan] = useState<FontScanResult | null>(null);
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, showStatus] = useTransientStatus(3500);

  const onProgress = (fraction: number) => setProgress(fraction);

  const handleScan = async () => {
    setIsScanning(true);
    setProgress(null);
    try {
      const result = await scanFonts(onProgress);
      setScan(result);
      if (result.fonts.length > 0 && !target.trim()) {
        setTarget(result.fonts[0].name);
      }
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Font scan failed");
    } finally {
      setIsScanning(false);
      setProgress(null);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    setProgress(null);
    try {
      const updated = await applyFontEverywhere(target, onProgress);
      showStatus(`Updated ${updated} ✓`);
      setScan((prev) =>
        prev
          ? { fonts: [{ name: target.trim(), count: updated }], elementsScanned: updated, mixedCount: 0 }
          : prev
      );
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Applying font failed");
    } finally {
      setIsApplying(false);
      setProgress(null);
    }
  };

  const busy = isScanning || isApplying;

  return (
    <div>
      <datalist id={FONT_DATALIST_ID}>
        {(scan?.fonts ?? []).map((f) => (
          <option key={f.name} value={f.name} />
        ))}
      </datalist>
      <SectionHeader
        label="Font Consistency"
        right={status ?? "one font across the deck"}
        rightColor={status ? tokens.success : tokens.textDisabled}
      />
      <div className={styles.column}>
        <EmphasizedButton height={34} onClick={handleScan} disabled={busy} title="List every font used on the slides">
          {isScanning ? `Scanning… ${Math.round((progress ?? 0) * 100)}%` : "Scan fonts across deck"}
        </EmphasizedButton>
        {busy && <ProgressBar fraction={progress ?? 0} />}
        {scan && (
          <>
            {scan.fonts.length === 0 ? (
              <div className={styles.helper}>No text found on the slides.</div>
            ) : (
              <div className={styles.fontList}>
                {scan.fonts.map((f) => (
                  <div key={f.name} className={styles.fontRow}>
                    <span>{f.name}</span>
                    <span className={styles.fontCount}>{f.count}</span>
                  </div>
                ))}
                {scan.mixedCount > 0 && (
                  <div className={styles.mixedNote}>
                    {scan.mixedCount} element{scan.mixedCount === 1 ? "" : "s"} mix multiple fonts
                  </div>
                )}
              </div>
            )}
            {scan.elementsScanned > 0 && (
              <>
                <TextField
                  id="ns-target-font"
                  label="Target font"
                  value={target}
                  onChange={setTarget}
                  list={FONT_DATALIST_ID}
                  placeholder="e.g. Segoe UI"
                />
                <EmphasizedButton
                  height={36}
                  onClick={handleApply}
                  disabled={busy || !target.trim()}
                  title="Sets the font family everywhere; sizes, weights, and colors stay as they are"
                >
                  {isApplying ? `Applying… ${Math.round((progress ?? 0) * 100)}%` : "Apply to all slides"}
                </EmphasizedButton>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FontConsistencySection;
