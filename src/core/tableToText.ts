/* global PowerPoint, Office */

import { sanitizeXmlText } from "./textSanitize";

export type TableTextMode = "cells" | "single";
export type SeparatorKey = "tab" | "space" | "comma" | "semicolon" | "pipe" | "newline";

export const SEPARATORS: Record<SeparatorKey, string> = {
  tab: "\t",
  space: " ",
  comma: ", ",
  semicolon: "; ",
  pipe: " | ",
  newline: "\n",
};

/** Cumulative offsets for a list of sizes, starting at 0. */
function offsets(sizes: number[]): number[] {
  const result: number[] = [0];
  for (let i = 0; i < sizes.length - 1; i++) {
    result.push(result[i] + sizes[i]);
  }
  return result;
}

/**
 * Converts the selected table into plain text boxes:
 * - "cells": one text box per non-empty cell, at the cell's position.
 * - "single": one text box covering the table, cells joined by the separator.
 * The table is deleted only after the text boxes are created.
 */
export async function convertTableToText(mode: TableTextMode, separator: SeparatorKey = "tab"): Promise<void> {
  if (!Office.context.requirements.isSetSupported("PowerPointApi", "1.8")) {
    throw new Error("Table conversion requires PowerPointApi 1.8 or later. Please update PowerPoint.");
  }
  const hasGeometry = Office.context.requirements.isSetSupported("PowerPointApi", "1.9");

  await PowerPoint.run(async (context) => {
    const selected = context.presentation.getSelectedShapes();
    selected.load("items/id,items/type,items/left,items/top,items/width,items/height");
    await context.sync();

    const tableShape = selected.items.find((s) => s.type === "Table");
    if (!tableShape) {
      throw new Error("Select a table first.");
    }

    const table = tableShape.getTable();
    table.load("values,rowCount,columnCount");
    await context.sync();

    const values = table.values;
    const rowCount = table.rowCount;
    const columnCount = table.columnCount;

    // Exact cell geometry (1.9) fails on some hosts (PowerPoint web has
    // returned unpopulated collections here), so load it in its own sync
    // and fall back to an even split on any problem.
    let columnWidths: number[] | null = null;
    let rowHeights: number[] | null = null;
    if (hasGeometry) {
      try {
        table.columns.load("items/width");
        table.rows.load("items/currentHeight");
        await context.sync();
        columnWidths = table.columns.items.map((c) => c.width);
        rowHeights = table.rows.items.map((r) => r.currentHeight);
      } catch {
        columnWidths = null;
        rowHeights = null;
      }
    }
    const geometryUsable =
      columnWidths?.length === columnCount &&
      rowHeights?.length === rowCount &&
      columnWidths.every((w) => Number.isFinite(w) && w > 0) &&
      rowHeights.every((h) => Number.isFinite(h) && h > 0);
    const cellWidths = geometryUsable ? columnWidths! : Array(columnCount).fill(tableShape.width / columnCount);
    const cellHeights = geometryUsable ? rowHeights! : Array(rowCount).fill(tableShape.height / rowCount);
    const columnOffsets = offsets(cellWidths);
    const rowOffsets = offsets(cellHeights);

    const slide = tableShape.getParentSlide();

    if (mode === "cells") {
      // Large tables mean hundreds of shape creations; sync in chunks so
      // a single giant batch can't hang or overwhelm the host.
      const CHUNK_SIZE = 20;
      let created = 0;
      for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
          const text = sanitizeXmlText(values[r][c] ?? "").trim();
          if (!text) continue; // merged-cell fillers and empty cells
          slide.shapes.addTextBox(text, {
            left: tableShape.left + columnOffsets[c],
            top: tableShape.top + rowOffsets[r],
            width: cellWidths[c],
            height: cellHeights[r],
          });
          created++;
          if (created % CHUNK_SIZE === 0) {
            await context.sync();
          }
        }
      }
    } else {
      const joined = values
        .map((row) => row.map((cell) => sanitizeXmlText(cell ?? "")).join(SEPARATORS[separator]))
        .join("\n");
      const box = slide.shapes.addTextBox(joined, {
        left: tableShape.left,
        top: tableShape.top,
        width: tableShape.width,
        height: tableShape.height,
      });
      box.textFrame.autoSizeSetting = "AutoSizeShapeToFitText";
    }

    // Create the text boxes first so a failure never destroys the table.
    await context.sync();
    tableShape.delete();
    await context.sync();
  });
}
