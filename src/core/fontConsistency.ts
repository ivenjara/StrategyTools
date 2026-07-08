/* global PowerPoint, Office */

import { TEXT_CAPABLE_SHAPE_TYPES } from "./shapeHelpers";

export interface FontScanResult {
  /** Fonts in use across the deck, sorted by usage count descending. */
  fonts: { name: string; count: number }[];
  /** Text-bearing elements scanned (shapes + table cells). */
  elementsScanned: number;
  /** Elements that mix multiple fonts internally (reported as null by the API). */
  mixedCount: number;
}

const CHUNK_SIZE = 25;

/** Called after each processed chunk with (done, total) element counts. */
export type FontProgress = (done: number, total: number) => void;

const STALL_MESSAGE =
  "PowerPoint stopped responding to the operation. Refresh the pane and try again — changes may be partially applied, and re-running is safe.";

/**
 * PowerPoint web occasionally never answers a sync, which would leave
 * the UI spinning forever. Reject after a generous stall window instead;
 * the underlying host operation may still finish in the background.
 */
async function withStallGuard<T>(work: Promise<T>, ms = 120000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(STALL_MESSAGE)), ms);
  });
  try {
    return await Promise.race([work, guard]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Walks every slide and returns font objects for all text-bearing
 * elements: text-capable shapes plus table cells (table cell fonts need
 * PowerPointApi 1.9; tables are skipped silently on older hosts).
 * Grouped shapes and slide masters/layouts are out of scope.
 * All loads are chunked — large single batches stall PowerPoint web.
 */
async function collectFontHolders(context: PowerPoint.RequestContext): Promise<PowerPoint.ShapeFont[]> {
  const hasTableFonts = Office.context.requirements.isSetSupported("PowerPointApi", "1.9");

  const slides = context.presentation.slides;
  slides.load("items");
  await context.sync();

  // Load each slide's shape list, a few slides at a time.
  for (let i = 0; i < slides.items.length; i += 10) {
    const batch = slides.items.slice(i, i + 10);
    for (const slide of batch) {
      slide.shapes.load("items/id,items/type");
    }
    await context.sync();
  }

  const holders: PowerPoint.ShapeFont[] = [];
  const tables: PowerPoint.Table[] = [];

  for (const slide of slides.items) {
    for (const shape of slide.shapes.items) {
      if (TEXT_CAPABLE_SHAPE_TYPES.has(shape.type)) {
        holders.push(shape.textFrame.textRange.font);
      } else if (shape.type === "Table" && hasTableFonts) {
        tables.push(shape.getTable());
      }
    }
  }

  if (tables.length > 0) {
    for (let i = 0; i < tables.length; i += CHUNK_SIZE) {
      for (const table of tables.slice(i, i + CHUNK_SIZE)) {
        table.load("rowCount,columnCount");
      }
      await context.sync();
    }

    for (const table of tables) {
      const cells: PowerPoint.TableCell[] = [];
      for (let r = 0; r < table.rowCount; r++) {
        for (let c = 0; c < table.columnCount; c++) {
          cells.push(table.getCellOrNullObject(r, c));
        }
      }
      for (let i = 0; i < cells.length; i += CHUNK_SIZE) {
        const batch = cells.slice(i, i + CHUNK_SIZE);
        for (const cell of batch) {
          cell.load("isNullObject");
        }
        await context.sync();
        for (const cell of batch) {
          if (!cell.isNullObject) holders.push(cell.font);
        }
      }
    }
  }

  return holders;
}

/**
 * Inventories the fonts used across the whole deck.
 */
export async function scanFonts(onProgress?: FontProgress): Promise<FontScanResult> {
  return withStallGuard(PowerPoint.run(async (context) => {
    const holders = await collectFontHolders(context);

    for (let i = 0; i < holders.length; i += CHUNK_SIZE) {
      for (const font of holders.slice(i, i + CHUNK_SIZE)) {
        font.load("name");
      }
      await context.sync();
      onProgress?.(Math.min(i + CHUNK_SIZE, holders.length), holders.length);
    }

    const counts = new Map<string, number>();
    let mixedCount = 0;
    for (const font of holders) {
      if (font.name === null || font.name === undefined) {
        mixedCount++;
      } else if (font.name) {
        counts.set(font.name, (counts.get(font.name) ?? 0) + 1);
      }
    }

    return {
      fonts: [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      elementsScanned: holders.length,
      mixedCount,
    };
  }));
}

/**
 * Sets every text element in the deck (shapes + table cells) to the
 * given font family. Sizes, weights, and colors are untouched. Elements
 * that mixed several fonts become uniform. Returns the element count.
 */
export async function applyFontEverywhere(fontName: string, onProgress?: FontProgress): Promise<number> {
  const trimmed = fontName.trim();
  if (!trimmed) {
    throw new Error("Enter a font name first.");
  }

  return withStallGuard(PowerPoint.run(async (context) => {
    const holders = await collectFontHolders(context);

    for (let i = 0; i < holders.length; i += CHUNK_SIZE) {
      for (const font of holders.slice(i, i + CHUNK_SIZE)) {
        font.name = trimmed;
      }
      await context.sync();
      onProgress?.(Math.min(i + CHUNK_SIZE, holders.length), holders.length);
    }

    return holders.length;
  }));
}
