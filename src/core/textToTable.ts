/* global PowerPoint, Office */

import { SeparatorKey } from "./tableToText";
import { TEXT_CAPABLE_SHAPE_TYPES } from "./shapeHelpers";
import { sanitizeXmlText } from "./textSanitize";

/** "newline" can't split cells — lines are rows. */
export type SplitSeparatorKey = Exclude<SeparatorKey, "newline">;

export interface TextToTableResult {
  mode: "parse" | "grid";
  rowCount: number;
  columnCount: number;
}

/**
 * Splitting must tolerate whitespace around delimiters, unlike the
 * join strings in SEPARATORS (", ", " | ", ...).
 */
const SPLIT_PATTERNS: Record<SplitSeparatorKey, RegExp> = {
  tab: /\t/,
  space: / +/,
  comma: /\s*,\s*/,
  semicolon: /\s*;\s*/,
  pipe: /\s*\|\s*/,
};

/**
 * `flattenNewlines` collapses newlines to spaces for the retry path on
 * hosts that reject multi-line cell values in addTable.
 */
function sanitizeCell(text: string, flattenNewlines: boolean): string {
  const normalized = sanitizeXmlText(text);
  return flattenNewlines ? normalized.replace(/\n+/g, " ").trim() : normalized;
}

/** Lines become rows; ragged rows are padded with "". */
function parseLinesToValues(text: string, separator: SplitSeparatorKey): string[][] {
  // \r = paragraph break, \x0B = soft line break in PowerPoint text ranges.
  const lines = text.split(/\r\n|\r|\n|\x0B/);
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  if (lines.length === 0) {
    throw new Error("The selected text box is empty.");
  }

  const rows = lines.map((line) => line.split(SPLIT_PATTERNS[separator]).map((cell) => cell.trim()));
  const columnCount = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => (r.length < columnCount ? [...r, ...Array(columnCount - r.length).fill("")] : r));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * 1-D gap-based agglomeration: sorted centers join the current cluster
 * while within `tolerance` of its running mean (comparing to the mean,
 * not the previous element, prevents chain-drift merging distinct rows).
 * Returns groups of original indices, in ascending center order.
 */
function clusterCenters(centers: number[], tolerance: number): number[][] {
  const order = centers.map((_, i) => i).sort((a, b) => centers[a] - centers[b]);
  const clusters: number[][] = [];
  let current: number[] = [];
  let mean = 0;

  for (const idx of order) {
    if (current.length > 0 && centers[idx] - mean > tolerance) {
      clusters.push(current);
      current = [];
    }
    current.push(idx);
    mean = current.reduce((sum, i) => sum + centers[i], 0) / current.length;
  }
  clusters.push(current);
  return clusters;
}

/**
 * Converts selected text boxes into a table:
 * - exactly 1 text box → parse its lines into rows, splitting cells by `separator`;
 * - 2+ text boxes → cluster them by position into a grid and snap into a table.
 * Source boxes are deleted only after the table is created.
 *
 * Punted for now: recursing into groups (the error tells the user to
 * ungroup), text-edit-mode selections, carrying fonts/colors into cells,
 * rotated boxes, custom row heights, table styling.
 */
export async function convertTextToTable(separator: SplitSeparatorKey = "tab"): Promise<TextToTableResult> {
  if (!Office.context.requirements.isSetSupported("PowerPointApi", "1.8")) {
    throw new Error("Table creation requires PowerPointApi 1.8 or later. Please update PowerPoint.");
  }

  try {
    return await runConversion(separator, false);
  } catch (err: unknown) {
    // Nothing is created or deleted when addTable rejects its options, so a
    // degraded retry is safe and can't duplicate the table. Some hosts
    // (PowerPoint web) throw InvalidArgument for per-column widths and for
    // multi-line cell values, so the retry drops both.
    if ((err as { code?: string })?.code === "InvalidArgument") {
      try {
        return await runConversion(separator, true);
      } catch (retryErr: unknown) {
        const location = (retryErr as { debugInfo?: { errorLocation?: string } })?.debugInfo?.errorLocation;
        if (retryErr instanceof Error && location) {
          retryErr.message = `${retryErr.message} (${location})`;
        }
        throw retryErr;
      }
    }
    throw err;
  }
}

async function runConversion(separator: SplitSeparatorKey, degraded: boolean): Promise<TextToTableResult> {
  return PowerPoint.run(async (context) => {
    const selected = context.presentation.getSelectedShapes();
    selected.load("items/id,items/type,items/left,items/top,items/width,items/height");
    await context.sync();

    const textBoxes = selected.items.filter((s) => TEXT_CAPABLE_SHAPE_TYPES.has(s.type));
    if (selected.items.length === 0) {
      throw new Error("Select one or more text boxes first.");
    }
    if (textBoxes.length === 0) {
      if (selected.items.some((s) => s.type === "Table")) {
        throw new Error("You selected a table — use Table → Text instead.");
      }
      throw new Error("The selection has no text boxes. If your boxes are grouped, ungroup them first.");
    }

    const textRanges = textBoxes.map((box) => {
      const range = box.textFrame.textRange;
      range.load("text");
      return range;
    });
    await context.sync();

    const mode: TextToTableResult["mode"] = textBoxes.length === 1 ? "parse" : "grid";
    let values: string[][];
    let left: number;
    let top: number;
    let width: number;
    let columnWidths: number[] | undefined;

    if (mode === "parse") {
      const box = textBoxes[0];
      values = parseLinesToValues(textRanges[0].text, separator);
      left = box.left;
      top = box.top;
      width = box.width;
    } else {
      const rowClusters = clusterCenters(
        textBoxes.map((b) => b.top + b.height / 2),
        Math.max(6, median(textBoxes.map((b) => b.height)) * 0.5)
      );
      const colClusters = clusterCenters(
        textBoxes.map((b) => b.left + b.width / 2),
        Math.max(6, median(textBoxes.map((b) => b.width)) * 0.5)
      );

      const rowOf = new Map<number, number>();
      rowClusters.forEach((cluster, r) => cluster.forEach((i) => rowOf.set(i, r)));
      const colOf = new Map<number, number>();
      colClusters.forEach((cluster, c) => cluster.forEach((i) => colOf.set(i, c)));

      values = rowClusters.map(() => colClusters.map(() => ""));
      // Reading order so same-cell collisions join top-to-bottom, left-to-right.
      const readingOrder = textBoxes
        .map((_, i) => i)
        .sort((a, b) => textBoxes[a].top - textBoxes[b].top || textBoxes[a].left - textBoxes[b].left);
      for (const i of readingOrder) {
        const r = rowOf.get(i)!;
        const c = colOf.get(i)!;
        const text = textRanges[i].text.replace(/\s+$/, "");
        values[r][c] = values[r][c] ? `${values[r][c]}\n${text}` : text;
      }

      left = Math.min(...textBoxes.map((b) => b.left));
      top = Math.min(...textBoxes.map((b) => b.top));
      const right = Math.max(...textBoxes.map((b) => b.left + b.width));
      width = right - left;

      // Column boundaries midway between adjacent cluster extents, so widths sum to the bounding width.
      const colLefts = colClusters.map((cluster) => Math.min(...cluster.map((i) => textBoxes[i].left)));
      const colRights = colClusters.map((cluster) =>
        Math.max(...cluster.map((i) => textBoxes[i].left + textBoxes[i].width))
      );
      const boundaries = [left];
      for (let c = 1; c < colClusters.length; c++) {
        boundaries.push((colRights[c - 1] + colLefts[c]) / 2);
      }
      boundaries.push(right);
      columnWidths = colClusters.map((_, c) => Math.max(boundaries[c + 1] - boundaries[c], 10));
    }

    values = values.map((row) => row.map((cell) => sanitizeCell(cell, degraded)));

    const slide = textBoxes[0].getParentSlide();
    slide.shapes.addTable(values.length, values[0].length, {
      values,
      left,
      top,
      width,
      ...(columnWidths && !degraded ? { columns: columnWidths.map((w) => ({ columnWidth: w })) } : {}),
    });

    // Create the table first so a failure never destroys the source boxes.
    await context.sync();
    for (const box of textBoxes) {
      box.delete();
    }
    await context.sync();

    return { mode, rowCount: values.length, columnCount: values[0].length };
  });
}
