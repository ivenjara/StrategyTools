/* global PowerPoint */

import { ShapePositionData } from "./types";
import { loadSelectedShapes, writePositionsWithRefresh } from "./shapeHelpers";

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
 */
export async function pastePosition(): Promise<void> {
  if (!copiedPosition) {
    throw new Error("No position copied. Select a shape and click Copy Position first.");
  }

  const pos = copiedPosition;
  await PowerPoint.run(async (context) => {
    const { shapes } = await loadSelectedShapes(context, 1);

    const newPositions = new Map<string, Partial<ShapePositionData>>();
    for (const shape of shapes) {
      newPositions.set(shape.id, { left: pos.left, top: pos.top });
    }

    await writePositionsWithRefresh(shapes, newPositions, context);
  });
}

/**
 * Paste All: Applies the copied position and size to the selected shape(s).
 */
export async function pasteSize(): Promise<void> {
  if (!copiedPosition) {
    throw new Error("No position copied. Select a shape and click Copy Position first.");
  }

  const pos = copiedPosition;
  await PowerPoint.run(async (context) => {
    const { shapes } = await loadSelectedShapes(context, 1);

    const newPositions = new Map<string, Partial<ShapePositionData>>();
    for (const shape of shapes) {
      newPositions.set(shape.id, {
        left: pos.left,
        top: pos.top,
        width: pos.width,
        height: pos.height,
      });
    }

    await writePositionsWithRefresh(shapes, newPositions, context);
  });
}

/**
 * Paste Size Only: Applies the copied width and height to the selected shape(s).
 * Position stays unchanged - only the size is matched.
 */
export async function pasteSizeOnly(): Promise<void> {
  if (!copiedPosition) {
    throw new Error("No position copied. Select a shape and click Copy Position first.");
  }

  const pos = copiedPosition;
  await PowerPoint.run(async (context) => {
    const { shapes } = await loadSelectedShapes(context, 1);

    const newPositions = new Map<string, Partial<ShapePositionData>>();
    for (const shape of shapes) {
      newPositions.set(shape.id, { width: pos.width, height: pos.height });
    }

    await writePositionsWithRefresh(shapes, newPositions, context);
  });
}

/** Returns whether a position has been copied */
export function hasPosition(): boolean {
  return copiedPosition !== null;
}
