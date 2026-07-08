/* global PowerPoint, Office */

import { TEXT_CAPABLE_SHAPE_TYPES } from "./shapeHelpers";

export const CM_TO_PT = 28.3465;

export interface MarginsCm {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Applies the given internal text margins (in cm) to the selection:
 * - shapes that can hold text get their text-frame margins set;
 * - tables get the margins applied to every cell (PowerPointApi 1.9+).
 * Returns the number of shapes/tables updated.
 */
export type MarginProgress = (fraction: number) => void;

export async function applyTextMargins(margins: MarginsCm, onProgress?: MarginProgress): Promise<number> {
  const hasCellMargins = Office.context.requirements.isSetSupported("PowerPointApi", "1.9");

  return PowerPoint.run(async (context) => {
    const selected = context.presentation.getSelectedShapes();
    selected.load("items/id,items/type");
    await context.sync();
    onProgress?.(0.1);

    if (selected.items.length < 1) {
      throw new Error("Select at least 1 shape or table.");
    }

    const textShapes = selected.items.filter((s) => TEXT_CAPABLE_SHAPE_TYPES.has(s.type));
    const tableShapes = selected.items.filter((s) => s.type === "Table");

    if (textShapes.length === 0 && tableShapes.length === 0) {
      throw new Error("Select shapes or a table first.");
    }
    if (tableShapes.length > 0 && !hasCellMargins) {
      throw new Error("Table cell margins require PowerPointApi 1.9 or later. Please update PowerPoint.");
    }

    const leftPt = margins.left * CM_TO_PT;
    const rightPt = margins.right * CM_TO_PT;
    const topPt = margins.top * CM_TO_PT;
    const bottomPt = margins.bottom * CM_TO_PT;

    for (const shape of textShapes) {
      const textFrame = shape.textFrame;
      textFrame.leftMargin = leftPt;
      textFrame.rightMargin = rightPt;
      textFrame.topMargin = topPt;
      textFrame.bottomMargin = bottomPt;
    }

    if (tableShapes.length > 0) {
      const tables = tableShapes.map((shape) => {
        const table = shape.getTable();
        table.load("rowCount,columnCount");
        return table;
      });
      await context.sync();
      onProgress?.(0.2);

      // Load and write cells in chunks — one giant batch across a large
      // table stalls PowerPoint web. Merged areas return null objects for
      // covered cells, hence the isNullObject guard.
      const CHUNK_SIZE = 25;
      const totalCells = tables.reduce((sum, t) => sum + t.rowCount * t.columnCount, 0);
      let processedCells = 0;
      for (const table of tables) {
        const coords: [number, number][] = [];
        for (let r = 0; r < table.rowCount; r++) {
          for (let c = 0; c < table.columnCount; c++) {
            coords.push([r, c]);
          }
        }
        for (let i = 0; i < coords.length; i += CHUNK_SIZE) {
          const batch = coords.slice(i, i + CHUNK_SIZE).map(([r, c]) => {
            const cell = table.getCellOrNullObject(r, c);
            cell.load("isNullObject");
            return cell;
          });
          await context.sync();

          for (const cell of batch) {
            if (cell.isNullObject) continue;
            cell.margins.left = leftPt;
            cell.margins.right = rightPt;
            cell.margins.top = topPt;
            cell.margins.bottom = bottomPt;
          }
          await context.sync();
          processedCells += batch.length;
          onProgress?.(0.2 + 0.75 * (processedCells / Math.max(1, totalCells)));
        }
      }
    }

    await context.sync();
    onProgress?.(1);
    return textShapes.length + tableShapes.length;
  });
}
