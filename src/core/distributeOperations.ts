/* global PowerPoint */

import { ShapePositionData } from "./types";
import { loadSelectedShapes, writePositionsWithRefresh } from "./shapeHelpers";

/**
 * Distribute Horizontally: Even spacing between 3+ shapes.
 * Shapes sorted by left position. Leftmost and rightmost stay in place.
 */
export async function distributeHorizontal(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 3);

    const sorted = [...data].sort((a, b) => a.left - b.left);

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalSpan = last.left + last.width - first.left;
    const totalShapeWidth = sorted.reduce((sum, s) => sum + s.width, 0);
    const totalGap = totalSpan - totalShapeWidth;
    const gapBetween = totalGap / (sorted.length - 1);

    const newPositions = new Map<string, Partial<ShapePositionData>>();
    let currentLeft = first.left;

    for (const s of sorted) {
      newPositions.set(s.id, { left: currentLeft });
      currentLeft += s.width + gapBetween;
    }

    await writePositionsWithRefresh(shapes, newPositions, context);
  });
}

/**
 * Distribute Vertically: Even spacing between 3+ shapes.
 * Shapes sorted by top position. Topmost and bottommost stay in place.
 */
export async function distributeVertical(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 3);

    const sorted = [...data].sort((a, b) => a.top - b.top);

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalSpan = last.top + last.height - first.top;
    const totalShapeHeight = sorted.reduce((sum, s) => sum + s.height, 0);
    const totalGap = totalSpan - totalShapeHeight;
    const gapBetween = totalGap / (sorted.length - 1);

    const newPositions = new Map<string, Partial<ShapePositionData>>();
    let currentTop = first.top;

    for (const s of sorted) {
      newPositions.set(s.id, { top: currentTop });
      currentTop += s.height + gapBetween;
    }

    await writePositionsWithRefresh(shapes, newPositions, context);
  });
}
