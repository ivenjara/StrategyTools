/* global PowerPoint */

import { ShapePositionData } from "./types";
import { loadSelectedShapes, writePositions } from "./shapeHelpers";

/**
 * Swap Position: Exchange the top-left coordinates of exactly 2 shapes.
 * Shape A moves to where Shape B was, and vice versa.
 */
export async function swapPosition(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);

    if (data.length !== 2) {
      throw new Error("Swap Position requires exactly 2 selected shapes.");
    }

    const [a, b] = data;
    const newPositions = new Map<string, Partial<ShapePositionData>>();
    newPositions.set(a.id, { left: b.left, top: b.top });
    newPositions.set(b.id, { left: a.left, top: a.top });

    writePositions(shapes, newPositions);
    await context.sync();
  });
}

/**
 * Swap Horizontal: Only swap the horizontal (left) positions.
 * Vertical (top) positions remain unchanged.
 * Preserves vertical alignment while exchanging columns.
 */
export async function swapHorizontal(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);

    if (data.length !== 2) {
      throw new Error("Swap Horizontal requires exactly 2 selected shapes.");
    }

    const [a, b] = data;
    const newPositions = new Map<string, Partial<ShapePositionData>>();
    newPositions.set(a.id, { left: b.left });
    newPositions.set(b.id, { left: a.left });

    writePositions(shapes, newPositions);
    await context.sync();
  });
}

/**
 * Swap Vertical: Only swap the vertical (top) positions.
 * Horizontal (left) positions remain unchanged.
 */
export async function swapVertical(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);

    if (data.length !== 2) {
      throw new Error("Swap Vertical requires exactly 2 selected shapes.");
    }

    const [a, b] = data;
    const newPositions = new Map<string, Partial<ShapePositionData>>();
    newPositions.set(a.id, { top: b.top });
    newPositions.set(b.id, { top: a.top });

    writePositions(shapes, newPositions);
    await context.sync();
  });
}

/**
 * Swap Center: Exchange positions based on center points.
 * Each shape's center moves to where the other shape's center was.
 * Ideal for differently-sized objects (e.g. McKinsey box tables).
 */
export async function swapCenter(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);

    if (data.length !== 2) {
      throw new Error("Swap Center requires exactly 2 selected shapes.");
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

    writePositions(shapes, newPositions);
    await context.sync();
  });
}
