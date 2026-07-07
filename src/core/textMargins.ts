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
export async function applyTextMargins(margins: MarginsCm): Promise<number> {
  const hasCellMargins = Office.context.requirements.isSetSupported("PowerPointApi", "1.9");

  return PowerPoint.run(async (context) => {
    const selected = context.presentation.getSelectedShapes();
    const count = selected.getCount();
    selected.load("items/id,items/type");
    await context.sync();

    if (count.value < 1) {
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

      // Collect cells first (merged areas return null objects for covered cells).
      const cells: PowerPoint.TableCell[] = [];
      for (const table of tables) {
        for (let r = 0; r < table.rowCount; r++) {
          for (let c = 0; c < table.columnCount; c++) {
            const cell = table.getCellOrNullObject(r, c);
            cell.load("isNullObject");
            cells.push(cell);
          }
        }
      }
      await context.sync();

      for (const cell of cells) {
        if (cell.isNullObject) continue;
        cell.margins.left = leftPt;
        cell.margins.right = rightPt;
        cell.margins.top = topPt;
        cell.margins.bottom = bottomPt;
      }
    }

    await context.sync();
    return textShapes.length + tableShapes.length;
  });
}
