/* global PowerPoint */

import { ShapePositionData } from "./types";

/**
 * Loads selected shapes within an existing PowerPoint.run context.
 * Returns the shape items and their position data.
 * Throws descriptive errors for common user mistakes (no selection, wrong count).
 */
export async function loadSelectedShapes(
  context: PowerPoint.RequestContext,
  minCount: number = 2
): Promise<{ shapes: PowerPoint.Shape[]; data: ShapePositionData[] }> {
  const selected = context.presentation.getSelectedShapes();
  const count = selected.getCount();
  selected.load("items/id,items/left,items/top,items/width,items/height");
  await context.sync();

  if (count.value < minCount) {
    throw new Error(
      `Select at least ${minCount} shape${minCount > 1 ? "s" : ""}. You selected ${count.value}.`
    );
  }

  const data: ShapePositionData[] = selected.items.map((s) => ({
    id: s.id,
    left: s.left,
    top: s.top,
    width: s.width,
    height: s.height,
  }));

  return { shapes: selected.items, data };
}

/**
 * Writes new positions to shape objects.
 * Call context.sync() after this to commit the changes.
 */
export function writePositions(
  shapes: PowerPoint.Shape[],
  newPositions: Map<string, Partial<ShapePositionData>>
): void {
  for (const shape of shapes) {
    const pos = newPositions.get(shape.id);
    if (pos) {
      if (pos.left !== undefined) shape.left = pos.left;
      if (pos.top !== undefined) shape.top = pos.top;
    }
  }
}

/**
 * Writes positions with an adaptive nudge trick for PowerPoint for Web.
 *
 * The web renderer can ignore tiny property changes, so we need a two-phase
 * write: nudge first, pause, then set final values. But for large movements
 * (paste position, swap) the renderer already detects the change, so we use
 * a minimal nudge and short pause to avoid visible delay.
 *
 * Strategy:
 *   - Measure the max distance any shape is moving.
 *   - If the movement is small (< 5pt, e.g. alignment), use a strong 5pt
 *     nudge in the opposite direction and a 150ms pause.
 *   - If the movement is large, use a tiny 0.5pt nudge and a 30ms pause.
 */
export async function writePositionsWithRefresh(
  shapes: PowerPoint.Shape[],
  newPositions: Map<string, Partial<ShapePositionData>>,
  context: PowerPoint.RequestContext
): Promise<void> {
  // Capture current values
  const current = new Map<string, { left: number; top: number; width: number; height: number }>();
  let maxDelta = 0;

  for (const shape of shapes) {
    const cur = { left: shape.left, top: shape.top, width: shape.width, height: shape.height };
    current.set(shape.id, cur);

    const pos = newPositions.get(shape.id);
    if (pos) {
      if (pos.left !== undefined) maxDelta = Math.max(maxDelta, Math.abs(pos.left - cur.left));
      if (pos.top !== undefined) maxDelta = Math.max(maxDelta, Math.abs(pos.top - cur.top));
      if (pos.width !== undefined) maxDelta = Math.max(maxDelta, Math.abs(pos.width - cur.width));
      if (pos.height !== undefined) maxDelta = Math.max(maxDelta, Math.abs(pos.height - cur.height));
    }
  }

  // Small movement → strong nudge; large movement → light nudge
  const isSmallMove = maxDelta < 5;
  const nudge = isSmallMove ? 5 : 0.5;
  const pause = isSmallMove ? 150 : 30;

  // Step 1: nudge away from target
  for (const shape of shapes) {
    const pos = newPositions.get(shape.id);
    const cur = current.get(shape.id);
    if (pos && cur) {
      if (pos.left !== undefined) {
        const dir = pos.left <= cur.left ? nudge : -nudge;
        shape.left = pos.left + dir;
      }
      if (pos.top !== undefined) {
        const dir = pos.top <= cur.top ? nudge : -nudge;
        shape.top = pos.top + dir;
      }
      if (pos.width !== undefined) shape.width = pos.width + nudge;
      if (pos.height !== undefined) shape.height = pos.height + nudge;
    }
  }
  await context.sync();

  await new Promise((resolve) => setTimeout(resolve, pause));

  // Step 2: final positions
  for (const shape of shapes) {
    const pos = newPositions.get(shape.id);
    if (pos) {
      if (pos.left !== undefined) shape.left = pos.left;
      if (pos.top !== undefined) shape.top = pos.top;
      if (pos.width !== undefined) shape.width = pos.width;
      if (pos.height !== undefined) shape.height = pos.height;
    }
  }
  await context.sync();
}
