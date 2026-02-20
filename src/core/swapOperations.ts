/* global PowerPoint */

import { ShapePositionData } from "./types";
import { loadSelectedShapes, writePositionsWithRefresh } from "./shapeHelpers";

/**
 * Swap Position: Exchange positions based on center points.
 * Each shape's center moves to where the other shape's center was,
 * so shapes land in the exact visual spot regardless of size differences.
 */
export async function swapPosition(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);

    if (data.length !== 2) {
      throw new Error("Swap Position requires exactly 2 selected shapes.");
    }

    const [a, b] = data;

    const aCenterX = a.left + a.width / 2;
    const aCenterY = a.top + a.height / 2;
    const bCenterX = b.left + b.width / 2;
    const bCenterY = b.top + b.height / 2;

    const newPositions = new Map<string, Partial<ShapePositionData>>();
    newPositions.set(a.id, {
      left: bCenterX - a.width / 2,
      top: bCenterY - a.height / 2,
    });
    newPositions.set(b.id, {
      left: aCenterX - b.width / 2,
      top: aCenterY - b.height / 2,
    });

    await writePositionsWithRefresh(shapes, newPositions, context);
  });
}

/**
 * Swap Horizontal: Only swap horizontal positions (center-based).
 * Vertical positions remain unchanged.
 */
export async function swapHorizontal(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);

    if (data.length !== 2) {
      throw new Error("Swap Horizontal requires exactly 2 selected shapes.");
    }

    const [a, b] = data;

    const aCenterX = a.left + a.width / 2;
    const bCenterX = b.left + b.width / 2;

    const newPositions = new Map<string, Partial<ShapePositionData>>();
    newPositions.set(a.id, { left: bCenterX - a.width / 2 });
    newPositions.set(b.id, { left: aCenterX - b.width / 2 });

    await writePositionsWithRefresh(shapes, newPositions, context);
  });
}

/**
 * Swap Vertical: Only swap vertical positions (center-based).
 * Horizontal positions remain unchanged.
 */
export async function swapVertical(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);

    if (data.length !== 2) {
      throw new Error("Swap Vertical requires exactly 2 selected shapes.");
    }

    const [a, b] = data;

    const aCenterY = a.top + a.height / 2;
    const bCenterY = b.top + b.height / 2;

    const newPositions = new Map<string, Partial<ShapePositionData>>();
    newPositions.set(a.id, { top: bCenterY - a.height / 2 });
    newPositions.set(b.id, { top: aCenterY - b.height / 2 });

    await writePositionsWithRefresh(shapes, newPositions, context);
  });
}

/**
 * Swap Top-Left: Exchange raw top-left coordinates (for same-size shapes).
 */
export async function swapTopLeft(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);

    if (data.length !== 2) {
      throw new Error("Swap Top-Left requires exactly 2 selected shapes.");
    }

    const [a, b] = data;
    const newPositions = new Map<string, Partial<ShapePositionData>>();
    newPositions.set(a.id, { left: b.left, top: b.top });
    newPositions.set(b.id, { left: a.left, top: a.top });

    await writePositionsWithRefresh(shapes, newPositions, context);
  });
}
