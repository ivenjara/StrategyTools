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
 * Writes positions with a nudge trick to force PowerPoint for Web to re-render.
 * First moves shapes to a tiny offset, syncs, waits briefly so the web renderer
 * processes the change, then moves to the final position and syncs again.
 */
export async function writePositionsWithRefresh(
  shapes: PowerPoint.Shape[],
  newPositions: Map<string, Partial<ShapePositionData>>,
  context: PowerPoint.RequestContext
): Promise<void> {
  const NUDGE = 0.5; // half a point offset

  // Step 1: nudge shapes to a slightly offset position
  for (const shape of shapes) {
    const pos = newPositions.get(shape.id);
    if (pos) {
      if (pos.left !== undefined) shape.left = pos.left + NUDGE;
      if (pos.top !== undefined) shape.top = pos.top + NUDGE;
      if (pos.width !== undefined) shape.width = pos.width + NUDGE;
      if (pos.height !== undefined) shape.height = pos.height + NUDGE;
    }
  }
  await context.sync();

  // Brief pause so the web renderer processes the nudge before the final move
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Step 2: move to the actual final position
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
