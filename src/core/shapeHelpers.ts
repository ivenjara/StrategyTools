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
 *
 * The web renderer can ignore tiny changes, so we use a two-phase approach:
 *   Phase 1 — move every shape to its ORIGINAL position offset by a visible amount
 *             (away from the target), then sync. This guarantees the renderer sees
 *             a meaningful property change for every shape.
 *   Phase 2 — after a pause, set the final target positions and sync again.
 *
 * The offset direction is chosen to maximise the delta: if a shape is moving
 * towards a smaller coordinate the nudge goes positive, and vice versa.
 */
export async function writePositionsWithRefresh(
  shapes: PowerPoint.Shape[],
  newPositions: Map<string, Partial<ShapePositionData>>,
  context: PowerPoint.RequestContext
): Promise<void> {
  const NUDGE = 5; // points — large enough for the web renderer to notice

  // Build a lookup of the current (pre-move) values so we can nudge from them
  const current = new Map<string, { left: number; top: number; width: number; height: number }>();
  for (const shape of shapes) {
    current.set(shape.id, {
      left: shape.left,
      top: shape.top,
      width: shape.width,
      height: shape.height,
    });
  }

  // Step 1: nudge each shape away from its target so the renderer detects a change
  for (const shape of shapes) {
    const pos = newPositions.get(shape.id);
    const cur = current.get(shape.id);
    if (pos && cur) {
      if (pos.left !== undefined) {
        const dir = pos.left <= cur.left ? NUDGE : -NUDGE;
        shape.left = pos.left + dir;
      }
      if (pos.top !== undefined) {
        const dir = pos.top <= cur.top ? NUDGE : -NUDGE;
        shape.top = pos.top + dir;
      }
      if (pos.width !== undefined) {
        shape.width = pos.width + NUDGE;
      }
      if (pos.height !== undefined) {
        shape.height = pos.height + NUDGE;
      }
    }
  }
  await context.sync();

  // Pause so the web renderer processes the intermediate state
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Step 2: set the actual final positions
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
