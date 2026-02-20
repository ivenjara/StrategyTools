/* global PowerPoint */

import { loadSelectedShapes, writePositions } from "./shapeHelpers";
import { ShapePositionData } from "./types";

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
 * Moves each selected shape to the exact same left/top as the copied shape.
 */
export async function pastePosition(): Promise<void> {
  if (!copiedPosition) {
    throw new Error("No position copied. Select a shape and click Copy Position first.");
  }

  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 1);

    const newPositions = new Map<string, Partial<ShapePositionData>>();
    data.forEach((s) => {
      newPositions.set(s.id, {
        left: copiedPosition!.left,
        top: copiedPosition!.top,
      });
    });

    writePositions(shapes, newPositions);
    await context.sync();
  });
}

/**
 * Paste Size: Applies the copied width and height to the selected shape(s).
 */
export async function pasteSize(): Promise<void> {
  if (!copiedPosition) {
    throw new Error("No position copied. Select a shape and click Copy Position first.");
  }

  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 1);

    const newPositions = new Map<string, Partial<ShapePositionData>>();
    data.forEach((s) => {
      newPositions.set(s.id, {
        left: copiedPosition!.left,
        top: copiedPosition!.top,
        width: copiedPosition!.width,
        height: copiedPosition!.height,
      });
    });

    // writePositions only handles left/top, so set width/height directly
    for (const shape of shapes) {
      shape.left = copiedPosition!.left;
      shape.top = copiedPosition!.top;
      shape.width = copiedPosition!.width;
      shape.height = copiedPosition!.height;
    }

    await context.sync();
  });
}

/** Returns whether a position has been copied */
export function hasPosition(): boolean {
  return copiedPosition !== null;
}
