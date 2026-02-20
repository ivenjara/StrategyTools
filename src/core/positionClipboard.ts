/* global PowerPoint */

import { loadSelectedShapes } from "./shapeHelpers";

/** Stored position data from the last copy operation */
let copiedPosition: { left: number; top: number; width: number; height: number } | null = null;

/**
 * Copy Position: Stores the position and size of the selected shape.
 * Works on exactly 1 shape.
 */
export async function copyPosition(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { data } = await loadSelectedShapes(context, 1);

    if (data.length !== 1) {
      throw new Error("Select exactly 1 shape to copy its position.");
    }

    const shape = data[0];
    copiedPosition = {
      left: shape.left,
      top: shape.top,
      width: shape.width,
      height: shape.height,
    };
  });
}

/**
 * Paste Position: Applies the copied position to the selected shape(s).
 * Uses nudge trick to force web rendering refresh.
 */
export async function pastePosition(): Promise<void> {
  if (!copiedPosition) {
    throw new Error("No position copied. Select a shape and click Copy Position first.");
  }

  const pos = copiedPosition;
  await PowerPoint.run(async (context) => {
    const { shapes } = await loadSelectedShapes(context, 1);

    // Nudge first to force web re-render
    for (const shape of shapes) {
      shape.left = pos.left + 0.5;
      shape.top = pos.top + 0.5;
    }
    await context.sync();

    // Final position
    for (const shape of shapes) {
      shape.left = pos.left;
      shape.top = pos.top;
    }
    await context.sync();
  });
}

/**
 * Paste All: Applies the copied position and size to the selected shape(s).
 * Uses nudge trick to force web rendering refresh.
 */
export async function pasteSize(): Promise<void> {
  if (!copiedPosition) {
    throw new Error("No position copied. Select a shape and click Copy Position first.");
  }

  const pos = copiedPosition;
  await PowerPoint.run(async (context) => {
    const { shapes } = await loadSelectedShapes(context, 1);

    // Nudge first
    for (const shape of shapes) {
      shape.left = pos.left + 0.5;
      shape.top = pos.top + 0.5;
      shape.width = pos.width;
      shape.height = pos.height;
    }
    await context.sync();

    // Final position
    for (const shape of shapes) {
      shape.left = pos.left;
      shape.top = pos.top;
    }
    await context.sync();
  });
}

/**
 * Paste Size Only: Applies the copied width and height to the selected shape(s).
 * Position stays unchanged — only the size is matched.
 */
export async function pasteSizeOnly(): Promise<void> {
  if (!copiedPosition) {
    throw new Error("No position copied. Select a shape and click Copy Position first.");
  }

  const pos = copiedPosition;
  await PowerPoint.run(async (context) => {
    const { shapes } = await loadSelectedShapes(context, 1);

    // Nudge first to force web re-render
    for (const shape of shapes) {
      shape.width = pos.width + 0.5;
      shape.height = pos.height + 0.5;
    }
    await context.sync();

    // Final size
    for (const shape of shapes) {
      shape.width = pos.width;
      shape.height = pos.height;
    }
    await context.sync();
  });
}

/** Returns whether a position has been copied */
export function hasPosition(): boolean {
  return copiedPosition !== null;
}
