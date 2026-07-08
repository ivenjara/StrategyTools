import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { makeStyles, mergeClasses, shorthands } from "@griffel/react";
import { tokens } from "../../theme/tokens";
import SectionHeader from "../primitives/SectionHeader";
import EmphasizedButton from "../primitives/EmphasizedButton";
import GridButton from "../primitives/GridButton";
import SegmentedControl from "../primitives/SegmentedControl";
import { TextField } from "../primitives/fields";
import { DownloadIcon, UploadIcon, TrashIcon } from "../primitives/icons";
import {
  LibraryEntry,
  InsertFormatting,
  saveSelectedSlidesToLibrary,
  listEntries,
  deleteEntry,
  insertEntry,
  exportLibrary,
  importLibrary,
} from "../../../core/slideLibrary";
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
  saveColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    maxHeight: "320px",
    overflowY: "auto",
    marginTop: "8px",
  },
  row: {
    backgroundColor: tokens.card,
    border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radiusButton,
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    ":hover": {
      backgroundColor: tokens.cardHover,
    },
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontSize: "13px",
    fontWeight: 600,
    color: tokens.textPrimary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowMeta: {
    fontSize: "11px",
    color: tokens.textMuted,
    marginTop: "2px",
  },
  insertButton: {
    height: "26px",
    padding: "0 10px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: tokens.emphBg,
    border: `1px solid ${tokens.emphBorder}`,
    borderRadius: tokens.radiusInput,
    color: tokens.textPrimary,
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
    ":hover": {
      ...shorthands.borderColor(tokens.accent),
      backgroundColor: tokens.emphHover,
    },
    ":disabled": {
      color: tokens.textDisabled,
      cursor: "default",
    },
  },
  deleteButton: {
    width: "26px",
    height: "26px",
    display: "grid",
    placeItems: "center",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: tokens.radiusInput,
    color: tokens.textMuted,
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
    ":hover": {
      color: tokens.danger,
      backgroundColor: tokens.hoverGhost,
    },
  },
  deleteArmed: {
    color: tokens.danger,
  },
  note: {
    fontSize: "12px",
    color: tokens.textMuted,
    padding: "14px 2px",
  },
  storageNote: {
    fontSize: "12px",
    color: tokens.warn,
    padding: "14px 2px",
  },
  transferRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  hint: {
    fontSize: "11px",
    color: tokens.textFaint,
    marginTop: "6px",
  },
});

function formatSavedDate(savedAt: number): string {
  const date = new Date(savedAt);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

const LibraryTab: React.FC<{ onError: OnError }> = ({ onError }) => {
  const styles = useStyles();
  const [entries, setEntries] = useState<LibraryEntry[] | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [formatting, setFormatting] = useState<InsertFormatting>("KeepSourceFormatting");
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [saveStatus, showSaveStatus] = useTransientStatus();
  const [libStatus, showLibStatus] = useTransientStatus();
  const fileRef = useRef<HTMLInputElement>(null);
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    listEntries()
      .then(setEntries)
      .catch((err: unknown) => {
        setStorageError(err instanceof Error ? err.message : "Storage unavailable");
        setEntries([]);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entry = await saveSelectedSlidesToLibrary(name);
      setEntries((prev) => [entry, ...(prev ?? [])]);
      setName("");
      showSaveStatus("Saved ✓");
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Saving to library failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInsert = async (entry: LibraryEntry) => {
    setBusyId(entry.id);
    try {
      await insertEntry(entry, formatting);
      showLibStatus("Inserted ✓");
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Inserting slides failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (armedDeleteId !== id) {
      setArmedDeleteId(id);
      if (disarmTimer.current) clearTimeout(disarmTimer.current);
      disarmTimer.current = setTimeout(() => setArmedDeleteId(null), 2500);
      return;
    }
    setArmedDeleteId(null);
    try {
      await deleteEntry(id);
      setEntries((prev) => (prev ?? []).filter((e) => e.id !== id));
      showLibStatus("Deleted ✓");
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Deleting entry failed");
    }
  };

  const handleExport = async () => {
    try {
      const count = await exportLibrary();
      showLibStatus(`Exported ${count} ✓`);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Export failed");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again re-fires onChange.
    e.target.value = "";
    if (!file) return;
    try {
      const count = await importLibrary(file);
      setEntries(await listEntries());
      showLibStatus(count > 0 ? `Imported ${count} ✓` : "Nothing new to import");
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Import failed");
    }
  };

  const loaded = entries !== null;
  const count = entries?.length ?? 0;
  const countLabel = count > 0 ? `${count} ${count === 1 ? "entry" : "entries"}` : "";

  return (
    <div className={styles.root}>
      <div>
        <SectionHeader label="Save to library" right={saveStatus ?? ""} rightColor={tokens.success} />
        <div className={styles.saveColumn}>
          <TextField id="ns-lib-name" label="Entry name" value={name} onChange={setName} />
          <EmphasizedButton
            height={38}
            onClick={handleSave}
            disabled={isSaving || !!storageError}
            title="Saves the slides currently selected in the slide panel"
          >
            {isSaving ? "Saving..." : "Save selected slides"}
          </EmphasizedButton>
        </div>
      </div>

      <div>
        <SectionHeader
          label="Library"
          right={libStatus ?? countLabel}
          rightColor={libStatus ? tokens.success : tokens.textDisabled}
        />
        <SegmentedControl
          fontSize="12px"
          options={[
            { value: "KeepSourceFormatting", label: "Keep design" },
            { value: "UseDestinationTheme", label: "Match deck" },
          ]}
          value={formatting}
          onChange={setFormatting}
        />
        {storageError ? (
          <div className={styles.storageNote}>{storageError}</div>
        ) : loaded && count === 0 ? (
          <div className={styles.note}>No saved slides yet. Select slides in the panel and save them above.</div>
        ) : (
          <div className={styles.list}>
            {(entries ?? []).map((entry) => (
              <div key={entry.id} className={styles.row}>
                <div className={styles.rowText}>
                  <div className={styles.rowName} title={entry.name}>
                    {entry.name}
                  </div>
                  <div className={styles.rowMeta}>
                    {entry.slideCount} slide{entry.slideCount === 1 ? "" : "s"} · {formatSavedDate(entry.savedAt)}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.insertButton}
                  disabled={busyId !== null}
                  title={`Insert after current slide (${formatting === "KeepSourceFormatting" ? "keep design" : "match deck"})`}
                  onClick={() => handleInsert(entry)}
                >
                  {busyId === entry.id ? "…" : "Insert"}
                </button>
                <button
                  type="button"
                  className={mergeClasses(styles.deleteButton, armedDeleteId === entry.id && styles.deleteArmed)}
                  title={armedDeleteId === entry.id ? "Click again to delete" : `Delete "${entry.name}"`}
                  onClick={() => handleDelete(entry.id)}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className={styles.transferRow}>
          <GridButton title="Download library as JSON" height={32} fontSize="12px" onClick={handleExport} disabled={count === 0}>
            <DownloadIcon />
            <span>Export</span>
          </GridButton>
          <GridButton
            title="Import library from JSON"
            height={32}
            fontSize="12px"
            onClick={() => fileRef.current?.click()}
            disabled={!!storageError}
          >
            <UploadIcon />
            <span>Import</span>
          </GridButton>
        </div>
        <input
          type="file"
          accept=".json,application/json"
          ref={fileRef}
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
        <div className={styles.hint}>Library is stored on this device only. Export to back up or move it.</div>
      </div>
    </div>
  );
};

export default LibraryTab;
