/* global PowerPoint, Office */

import { sanitizeXmlText } from "./textSanitize";
import { writePositionsWithRefresh } from "./shapeHelpers";
import { ShapePositionData } from "./types";

const CHUNK_SIZE = 25;

/** Reports overall progress as a fraction in [0, 1]. */
export type TableToolProgress = (fraction: number) => void;

/** Cumulative offsets for a list of sizes, starting at 0. */
function offsets(sizes: number[]): number[] {
  const result: number[] = [0];
  for (let i = 0; i < sizes.length - 1; i++) {
    result.push(result[i] + sizes[i]);
  }
  return result;
}

/**
 * Column widths / row heights for a table, with an even-split fallback —
 * the 1.9 geometry reads are unreliable on PowerPoint web.
 */
async function getTableGeometry(
  context: PowerPoint.RequestContext,
  tableShape: PowerPoint.Shape,
  table: PowerPoint.Table
): Promise<{ columnWidths: number[]; rowHeights: number[] }> {
  const hasGeometry = Office.context.requirements.isSetSupported("PowerPointApi", "1.9");
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

  const usable =
    columnWidths?.length === table.columnCount &&
    rowHeights?.length === table.rowCount &&
    columnWidths.every((w) => Number.isFinite(w) && w > 0) &&
    rowHeights.every((h) => Number.isFinite(h) && h > 0);

  return {
    columnWidths: usable ? columnWidths! : Array(table.columnCount).fill(tableShape.width / table.columnCount),
    rowHeights: usable ? rowHeights! : Array(table.rowCount).fill(tableShape.height / table.rowCount),
  };
}

interface CellStyle {
  font?: PowerPoint.FontProperties;
  fill?: PowerPoint.FillProperties;
  horizontalAlignment?: PowerPoint.TableCellProperties["horizontalAlignment"];
}

/**
 * Swaps the selected table's rows and columns. Basic per-cell formatting
 * (solid fill, font family/size/color/bold/italic, horizontal alignment)
 * is carried over on hosts that can read it (1.9); merged tables are
 * refused. The original table is deleted only after the transposed one
 * is created.
 */
export async function transposeTable(onProgress?: TableToolProgress): Promise<{ rows: number; columns: number }> {
  if (!Office.context.requirements.isSetSupported("PowerPointApi", "1.8")) {
    throw new Error("Table transposing requires PowerPointApi 1.8 or later. Please update PowerPoint.");
  }

  try {
    return await runTranspose(false, onProgress);
  } catch (err: unknown) {
    // Nothing is created or deleted when addTable rejects its options;
    // retry without per-column widths and cell formatting (web quirk).
    if ((err as { code?: string })?.code === "InvalidArgument") {
      return runTranspose(true, onProgress);
    }
    throw err;
  }
}

async function runTranspose(
  degraded: boolean,
  onProgress?: TableToolProgress
): Promise<{ rows: number; columns: number }> {
  const hasCellReads = Office.context.requirements.isSetSupported("PowerPointApi", "1.9");

  return PowerPoint.run(async (context) => {
    const selected = context.presentation.getSelectedShapes();
    selected.load("items/id,items/type,items/left,items/top,items/width,items/height");
    await context.sync();

    const tableShape = selected.items.find((s) => s.type === "Table");
    if (!tableShape) {
      throw new Error("Select a table first.");
    }

    const table = tableShape.getTable();
    table.load("values,rowCount,columnCount");
    const mergedAreas = table.getMergedAreas();
    mergedAreas.load("items/rowCount,items/columnCount");
    await context.sync();

    if (mergedAreas.items.some((c) => c.rowCount > 1 || c.columnCount > 1)) {
      throw new Error("This table has merged cells — unmerge them first, then transpose.");
    }
    onProgress?.(0.1);

    const rowCount = table.rowCount;
    const columnCount = table.columnCount;
    const { rowHeights } = await getTableGeometry(context, tableShape, table);
    onProgress?.(0.2);

    // Per-cell formatting, chunked. Best-effort: skipped entirely on
    // hosts without 1.9 or in the degraded retry.
    let styles: CellStyle[][] | null = null;
    if (hasCellReads && !degraded) {
      const cells: (PowerPoint.TableCell | null)[] = [];
      const flat: PowerPoint.TableCell[] = [];
      for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
          const cell = table.getCellOrNullObject(r, c);
          cells.push(cell);
          flat.push(cell);
        }
      }
      try {
        for (let i = 0; i < flat.length; i += CHUNK_SIZE) {
          const batch = flat.slice(i, i + CHUNK_SIZE);
          for (const cell of batch) {
            cell.load(
              "isNullObject,horizontalAlignment,font/name,font/size,font/color,font/bold,font/italic,fill/type,fill/foregroundColor"
            );
          }
          await context.sync();
          onProgress?.(0.2 + 0.6 * (Math.min(i + CHUNK_SIZE, flat.length) / flat.length));
        }
        styles = [];
        for (let r = 0; r < rowCount; r++) {
          const row: CellStyle[] = [];
          for (let c = 0; c < columnCount; c++) {
            const cell = cells[r * columnCount + c];
            const style: CellStyle = {};
            if (cell && !cell.isNullObject) {
              const font: PowerPoint.FontProperties = {};
              if (cell.font.name) font.name = cell.font.name;
              if (cell.font.size !== null && cell.font.size !== undefined) font.size = cell.font.size;
              if (cell.font.color) font.color = cell.font.color;
              if (cell.font.bold !== null && cell.font.bold !== undefined) font.bold = cell.font.bold;
              if (cell.font.italic !== null && cell.font.italic !== undefined) font.italic = cell.font.italic;
              if (Object.keys(font).length > 0) style.font = font;
              if (cell.fill.type === "Solid" && cell.fill.foregroundColor) {
                style.fill = { color: cell.fill.foregroundColor };
              }
              if (cell.horizontalAlignment) style.horizontalAlignment = cell.horizontalAlignment;
            }
            row.push(style);
          }
          styles.push(row);
        }
      } catch {
        styles = null; // formatting is best-effort
      }
    }

    // Transpose values and styles: new[c][r] = old[r][c].
    const values: string[][] = [];
    const cellProperties: PowerPoint.TableCellProperties[][] = [];
    for (let c = 0; c < columnCount; c++) {
      const valueRow: string[] = [];
      const propsRow: PowerPoint.TableCellProperties[] = [];
      for (let r = 0; r < rowCount; r++) {
        valueRow.push(sanitizeXmlText(table.values[r][c] ?? ""));
        propsRow.push(styles ? styles[r][c] : {});
      }
      values.push(valueRow);
      cellProperties.push(propsRow);
    }

    const slide = tableShape.getParentSlide();
    slide.shapes.addTable(columnCount, rowCount, {
      values,
      left: tableShape.left,
      top: tableShape.top,
      width: tableShape.width,
      // Original row heights become the new column proportions.
      ...(degraded
        ? {}
        : {
            columns: rowHeights.map((h) => ({ columnWidth: Math.max(h, 10) })),
            ...(styles ? { specificCellProperties: cellProperties } : {}),
          }),
    });

    // Create the new table first so a failure never destroys the original.
    await context.sync();
    onProgress?.(0.9);
    tableShape.delete();
    await context.sync();
    onProgress?.(1);

    return { rows: columnCount, columns: rowCount };
  });
}

/**
 * Centers each selected shape inside the table cell its center sits
 * over. The table comes from the selection, or from the slide when it
 * holds exactly one table. Returns the number of shapes moved.
 */
export async function alignShapesToCells(onProgress?: TableToolProgress): Promise<number> {
  return PowerPoint.run(async (context) => {
    const selected = context.presentation.getSelectedShapes();
    selected.load("items/id,items/type,items/left,items/top,items/width,items/height");
    await context.sync();
    onProgress?.(0.2);

    if (selected.items.length === 0) {
      throw new Error("Select the shapes to align (and the table, if the slide has several).");
    }

    const movable = selected.items.filter((s) => s.type !== "Table");
    if (movable.length === 0) {
      throw new Error("Select the shapes to align along with the table.");
    }

    let tableShape = selected.items.find((s) => s.type === "Table");
    if (!tableShape) {
      const slide = movable[0].getParentSlide();
      slide.shapes.load("items/id,items/type,items/left,items/top,items/width,items/height");
      await context.sync();
      const tables = slide.shapes.items.filter((s) => s.type === "Table");
      if (tables.length === 0) {
        throw new Error("No table found — select the shapes and make sure the slide has a table.");
      }
      if (tables.length > 1) {
        throw new Error("This slide has several tables — include the target table in your selection.");
      }
      tableShape = tables[0];
    }
    onProgress?.(0.4);

    const table = tableShape.getTable();
    table.load("rowCount,columnCount");
    await context.sync();
    const { columnWidths, rowHeights } = await getTableGeometry(context, tableShape, table);
    onProgress?.(0.6);
    const columnOffsets = offsets(columnWidths);
    const rowOffsets = offsets(rowHeights);

    const cellIndex = (position: number, cellOffsets: number[], sizes: number[]): number | null => {
      for (let i = cellOffsets.length - 1; i >= 0; i--) {
        if (position >= cellOffsets[i]) {
          return position <= cellOffsets[i] + sizes[i] ? i : null;
        }
      }
      return null;
    };

    const newPositions = new Map<string, Partial<ShapePositionData>>();
    for (const shape of movable) {
      const centerX = shape.left + shape.width / 2 - tableShape.left;
      const centerY = shape.top + shape.height / 2 - tableShape.top;
      const col = cellIndex(centerX, columnOffsets, columnWidths);
      const row = cellIndex(centerY, rowOffsets, rowHeights);
      if (col === null || row === null) continue; // shape isn't over the table

      newPositions.set(shape.id, {
        left: tableShape.left + columnOffsets[col] + columnWidths[col] / 2 - shape.width / 2,
        top: tableShape.top + rowOffsets[row] + rowHeights[row] / 2 - shape.height / 2,
      });
    }

    if (newPositions.size === 0) {
      throw new Error("No selected shapes sit over the table.");
    }

    const moving = movable.filter((s) => newPositions.has(s.id));
    onProgress?.(0.8);
    await writePositionsWithRefresh(moving, newPositions, context);
    onProgress?.(1);
    return newPositions.size;
  });
}
