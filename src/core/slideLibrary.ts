/* global PowerPoint, Office */

import { getSelectedSlideInfo, getSelectedSlidesBase64, triggerDownload } from "./saveAndSend";

export interface LibraryEntry {
  id: string;
  name: string;
  /** base64-encoded .pptx containing the saved slides */
  base64: string;
  slideCount: number;
  /** epoch ms */
  savedAt: number;
}

export type InsertFormatting = "KeepSourceFormatting" | "UseDestinationTheme";

const DB_NAME = "nightshift-slide-library";
const DB_VERSION = 1;
const STORE = "entries";
const LIBRARY_FILE_VERSION = 1;

const STORAGE_ERROR =
  "Slide library storage isn't available here. This can happen in private browsing or when the browser blocks add-in storage.";

function genId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

let cachedDb: IDBDatabase | null = null;

function openDb(): Promise<IDBDatabase> {
  if (cachedDb) return Promise.resolve(cachedDb);
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error(STORAGE_ERROR));
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      reject(new Error(STORAGE_ERROR));
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      cachedDb = request.result;
      cachedDb.onclose = () => {
        cachedDb = null;
      };
      cachedDb.onversionchange = () => {
        cachedDb?.close();
        cachedDb = null;
      };
      resolve(request.result);
    };
    request.onerror = () => reject(new Error(STORAGE_ERROR));
    request.onblocked = () => reject(new Error(STORAGE_ERROR));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let result: T | undefined;
    const request = fn(tx.objectStore(STORE));
    if (request) {
      request.onsuccess = () => {
        result = request.result;
      };
    }
    tx.oncomplete = () => resolve(result as T);
    tx.onerror = () => reject(new Error(STORAGE_ERROR));
    tx.onabort = () => reject(new Error(STORAGE_ERROR));
  });
}

/**
 * Saves the currently selected slides as a named library entry.
 */
export async function saveSelectedSlidesToLibrary(name: string): Promise<LibraryEntry> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Enter a name for the library entry first.");
  }

  const info = await getSelectedSlideInfo();
  const base64 = await getSelectedSlidesBase64(info.slideIds);

  const entry: LibraryEntry = {
    id: genId(),
    name: trimmed,
    base64,
    slideCount: info.slideIds.length,
    savedAt: Date.now(),
  };
  await withStore("readwrite", (store) => store.put(entry));
  return entry;
}

export async function listEntries(): Promise<LibraryEntry[]> {
  const entries = await withStore<LibraryEntry[]>("readonly", (store) => store.getAll());
  return entries.sort((a, b) => b.savedAt - a.savedAt);
}

export async function deleteEntry(id: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
}

/**
 * Inserts an entry's slides after the currently selected slide
 * (after the last selected slide in deck order; end of deck when no
 * slide is selected; beginning when the deck is empty).
 */
export async function insertEntry(entry: LibraryEntry, formatting: InsertFormatting): Promise<void> {
  if (!Office.context.requirements.isSetSupported("PowerPointApi", "1.2")) {
    throw new Error("Inserting slides requires PowerPointApi 1.2 or later. Please update PowerPoint.");
  }
  const hasSelectionApi = Office.context.requirements.isSetSupported("PowerPointApi", "1.5");

  try {
    await PowerPoint.run(async (context) => {
      let targetSlideId: string | undefined;

      if (hasSelectionApi) {
        const allSlides = context.presentation.slides;
        allSlides.load("items/id");
        const selected = context.presentation.getSelectedSlides();
        selected.load("items/id");
        await context.sync();

        const selectedIds = new Set(selected.items.map((s) => s.id));
        if (selectedIds.size > 0) {
          // Last selected slide in deck order, so inserts land after the selection.
          for (const slide of allSlides.items) {
            if (selectedIds.has(slide.id)) targetSlideId = slide.id;
          }
        } else if (allSlides.items.length > 0) {
          targetSlideId = allSlides.items[allSlides.items.length - 1].id;
        }
      }

      context.presentation.insertSlidesFromBase64(entry.base64, {
        formatting,
        ...(targetSlideId ? { targetSlideId } : {}),
      });
      await context.sync();
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (!message || message === "GeneralException") {
      throw new Error("Couldn't insert slides — the entry may be too large for PowerPoint on the web.");
    }
    throw err;
  }
}

/**
 * Downloads the whole library as a JSON file. Returns the entry count.
 */
export async function exportLibrary(): Promise<number> {
  const entries = await listEntries();
  if (entries.length === 0) {
    throw new Error("Library is empty — nothing to export.");
  }
  const payload = { version: LIBRARY_FILE_VERSION, exportedAt: Date.now(), entries };
  const date = new Date().toISOString().slice(0, 10);
  triggerDownload(new Blob([JSON.stringify(payload)], { type: "application/json" }), `Slide library ${date}.json`);
  return entries.length;
}

/**
 * Merges a previously exported library file into the current library.
 * Entries whose id already exists are skipped (re-importing a backup is
 * idempotent). Returns the number of entries actually imported.
 */
export async function importLibrary(file: File): Promise<number> {
  const INVALID = "This file is not a valid slide library export.";

  let data: { version?: unknown; entries?: unknown };
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error(INVALID);
  }
  if (typeof data.version !== "number" || data.version > LIBRARY_FILE_VERSION || !Array.isArray(data.entries)) {
    throw new Error(INVALID);
  }

  const candidates: LibraryEntry[] = [];
  for (const raw of data.entries as Partial<LibraryEntry>[]) {
    if (typeof raw?.name !== "string" || typeof raw?.base64 !== "string" || raw.base64.length === 0) continue;
    candidates.push({
      id: typeof raw.id === "string" && raw.id ? raw.id : genId(),
      name: raw.name,
      base64: raw.base64,
      slideCount: typeof raw.slideCount === "number" && raw.slideCount > 0 ? raw.slideCount : 1,
      savedAt: typeof raw.savedAt === "number" ? raw.savedAt : Date.now(),
    });
  }
  if (candidates.length === 0) {
    if ((data.entries as unknown[]).length > 0) throw new Error(INVALID);
    return 0;
  }

  const existingIds = new Set((await listEntries()).map((e) => e.id));
  const fresh = candidates.filter((e) => !existingIds.has(e.id));
  if (fresh.length === 0) return 0;

  await withStore("readwrite", (store) => {
    for (const entry of fresh) {
      store.put(entry);
    }
  });
  return fresh.length;
}
