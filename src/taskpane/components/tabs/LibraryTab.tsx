import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  updateEntryCategory,
  exportLibrary,
  importLibrary,
} from "../../../core/slideLibrary";
import { useTransientStatus } from "../useTransientStatus";
import { OnError } from "../App";

const CATEGORY_DATALIST_ID = "ns-category-options";

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
  libraryColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    maxHeight: "320px",
    overflowY: "auto",
  },
  groupHeader: {
    fontSize: "10.5px",
    fontWeight: 600,
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: tokens.textFaint,
    marginTop: "6px",
  },
  row: {
    backgroundColor: tokens.card,
    border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radiusButton,
    padding: "8px 10px",
    ":hover": {
      backgroundColor: tokens.cardHover,
    },
  },
  rowHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    cursor: "pointer",
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
  thumb: {
    width: "56px",
    height: "32px",
    objectFit: "cover",
    borderRadius: "4px",
    border: `1px solid ${tokens.borderControl}`,
    flexShrink: 0,
    cursor: "pointer",
    backgroundColor: tokens.inputBg,
  },
  previewStrip: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "8px",
  },
  previewImage: {
    width: "100%",
    borderRadius: "4px",
    border: `1px solid ${tokens.borderControl}`,
    display: "block",
  },
  categoryRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  categoryLabel: {
    fontSize: "12px",
    color: tokens.textMuted,
    whiteSpace: "nowrap",
  },
  categoryInput: {
    flex: 1,
    height: "30px",
    padding: "0 8px",
    border: `1px solid ${tokens.borderControl}`,
    borderRadius: tokens.radiusInput,
    fontSize: "12.5px",
    color: tokens.textPrimary,
    backgroundColor: tokens.inputBg,
    outlineStyle: "none",
    fontFamily: "inherit",
    ":focus": {
      ...shorthands.borderColor(tokens.accent),
    },
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
  deleteConfirm: {
    height: "26px",
    padding: "0 8px",
    fontSize: "11px",
    fontWeight: 600,
    backgroundColor: "transparent",
    border: `1px solid ${tokens.danger}`,
    borderRadius: tokens.radiusInput,
    color: tokens.danger,
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
    ":hover": {
      backgroundColor: tokens.hoverGhost,
    },
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
  storageLine: {
    fontSize: "11px",
    color: tokens.textFaint,
    marginTop: "3px",
  },
  storageLineWarn: {
    color: tokens.warn,
  },
});

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/** Export/import serializes the whole library into one JSON string; past this it gets slow. */
const LIBRARY_SIZE_WARN_BYTES = 80 * 1024 * 1024;

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
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [formatting, setFormatting] = useState<InsertFormatting>("KeepSourceFormatting");
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saveStatus, showSaveStatus] = useTransientStatus();
  const [libStatus, showLibStatus] = useTransientStatus();
  const fileRef = useRef<HTMLInputElement>(null);
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [quota, setQuota] = useState<number | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      navigator.storage
        .estimate()
        .then((estimate) => setQuota(estimate.quota ?? null))
        .catch(() => setQuota(null));
    }
  }, []);

  // base64/PNG strings are ASCII, so string length ≈ stored bytes.
  const librarySize = useMemo(
    () =>
      (entries ?? []).reduce(
        (sum, e) => sum + e.base64.length + (e.thumbnails ?? []).reduce((s, t) => s + t.length, 0),
        0
      ),
    [entries]
  );

  useEffect(() => {
    listEntries()
      .then(setEntries)
      .catch((err: unknown) => {
        setStorageError(err instanceof Error ? err.message : "Storage unavailable");
        setEntries([]);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const entry of entries ?? []) {
      if (entry.category) set.add(entry.category);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = entries ?? [];
    if (!q) return all;
    return all.filter(
      (e) => e.name.toLowerCase().includes(q) || (e.category ?? "").toLowerCase().includes(q)
    );
  }, [entries, query]);

  const groups = useMemo(() => {
    if (categories.length === 0) {
      return [{ label: null as string | null, items: filtered }];
    }
    const result: { label: string | null; items: LibraryEntry[] }[] = categories.map((c) => ({
      label: c,
      items: filtered.filter((e) => e.category === c),
    }));
    result.push({ label: "Other", items: filtered.filter((e) => !e.category) });
    return result.filter((g) => g.items.length > 0);
  }, [categories, filtered]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entry = await saveSelectedSlidesToLibrary(name, category);
      setEntries((prev) => [entry, ...(prev ?? [])]);
      setName("");
      setCategory("");
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
      disarmTimer.current = setTimeout(() => setArmedDeleteId(null), 4000);
      return;
    }
    setArmedDeleteId(null);
    try {
      await deleteEntry(id);
      // Re-read from IndexedDB rather than trusting local state, so a
      // silently failed delete is visible instead of resurfacing later.
      const fresh = await listEntries();
      setEntries(fresh);
      if (fresh.some((e) => e.id === id)) {
        onError("The entry couldn't be deleted from storage — try again.");
      } else {
        showLibStatus("Deleted ✓");
      }
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Deleting entry failed");
    }
  };

  const handleCategoryCommit = async (entry: LibraryEntry, raw: string) => {
    const next = raw.trim();
    const current = entry.category ?? "";
    if (next === current) return;
    try {
      await updateEntryCategory(entry.id, next || null);
      setEntries((prev) =>
        (prev ?? []).map((e) => {
          if (e.id !== entry.id) return e;
          const updated = { ...e };
          if (next) {
            updated.category = next;
          } else {
            delete updated.category;
          }
          return updated;
        })
      );
      showLibStatus("Moved ✓");
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Updating category failed");
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
  const searching = query.trim().length > 0;

  const renderRow = (entry: LibraryEntry) => {
    const hasThumbs = !!entry.thumbnails?.length;
    const expanded = expandedId === entry.id;
    const togglePreview = () => setExpandedId(expanded ? null : entry.id);
    const previewTitle = expanded ? "Hide details" : hasThumbs ? "Click to preview" : "Click for details";
    return (
      <div key={entry.id} className={styles.row}>
        <div className={styles.rowHeader}>
          {hasThumbs && (
            <img
              className={styles.thumb}
              src={`data:image/png;base64,${entry.thumbnails![0]}`}
              alt=""
              title={previewTitle}
              onClick={togglePreview}
            />
          )}
          <div className={styles.rowText} title={previewTitle} onClick={togglePreview}>
            <div className={styles.rowName}>{entry.name}</div>
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
          {armedDeleteId === entry.id ? (
            <button
              type="button"
              className={styles.deleteConfirm}
              title="Click to permanently delete this entry"
              onClick={() => handleDelete(entry.id)}
            >
              Delete?
            </button>
          ) : (
            <button
              type="button"
              className={styles.deleteButton}
              title={`Delete "${entry.name}"`}
              onClick={() => handleDelete(entry.id)}
            >
              <TrashIcon />
            </button>
          )}
        </div>
        {expanded && (
          <div className={styles.previewStrip}>
            <div className={styles.categoryRow}>
              <label className={styles.categoryLabel} htmlFor={`ns-cat-${entry.id}`}>
                Category
              </label>
              <input
                id={`ns-cat-${entry.id}`}
                className={styles.categoryInput}
                key={`${entry.id}-${entry.category ?? ""}`}
                defaultValue={entry.category ?? ""}
                placeholder="None"
                list={CATEGORY_DATALIST_ID}
                onBlur={(e) => handleCategoryCommit(entry, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
              />
            </div>
            {(entry.thumbnails ?? []).map((thumb, i) => (
              <img
                key={i}
                className={styles.previewImage}
                src={`data:image/png;base64,${thumb}`}
                alt={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.root}>
      <datalist id={CATEGORY_DATALIST_ID}>
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div>
        <SectionHeader label="Save to library" right={saveStatus ?? ""} rightColor={tokens.success} />
        <div className={styles.saveColumn}>
          <TextField id="ns-lib-name" label="Entry name" value={name} onChange={setName} />
          <TextField
            id="ns-lib-category"
            label="Category"
            value={category}
            onChange={setCategory}
            placeholder="Optional — e.g. Frameworks"
            list={CATEGORY_DATALIST_ID}
          />
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
        <div className={styles.libraryColumn}>
          {count > 0 && (
            <TextField id="ns-lib-search" value={query} onChange={setQuery} placeholder="Search library…" />
          )}
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
          ) : searching && filtered.length === 0 ? (
            <div className={styles.note}>No matches.</div>
          ) : (
            <div className={styles.list}>
              {groups.map((group) => (
                <React.Fragment key={group.label ?? "__all"}>
                  {group.label !== null && <div className={styles.groupHeader}>{group.label}</div>}
                  {group.items.map(renderRow)}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
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
        {count > 0 && (
          <div
            className={mergeClasses(
              styles.storageLine,
              librarySize > LIBRARY_SIZE_WARN_BYTES && styles.storageLineWarn
            )}
          >
            Using {formatBytes(librarySize)}
            {quota !== null ? ` of ${formatBytes(quota)} available` : ""}
            {librarySize > LIBRARY_SIZE_WARN_BYTES ? " — large libraries export slowly; consider pruning." : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryTab;
