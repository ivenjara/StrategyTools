/* global PowerPoint */

import { ShapePositionData } from "./types";
import { loadSelectedShapes, writePositions } from "./shapeHelpers";

/** Align all shapes to the leftmost edge. */
export async function alignLeft(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);
    const minLeft = Math.min(...data.map((s) => s.left));
    const newPositions = new Map<string, Partial<ShapePositionData>>();
    data.forEach((s) => newPositions.set(s.id, { left: minLeft }));
    writePositions(shapes, newPositions);
    await context.sync();
  });
}

/** Align all shapes to the rightmost edge. */
export async function alignRight(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);
    const maxRight = Math.max(...data.map((s) => s.left + s.width));
    const newPositions = new Map<string, Partial<ShapePositionData>>();
    data.forEach((s) => newPositions.set(s.id, { left: maxRight - s.width }));
    writePositions(shapes, newPositions);
    await context.sync();
  });
}

/** Align all shapes to the horizontal center of the bounding box. */
export async function alignCenter(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);
    const minLeft = Math.min(...data.map((s) => s.left));
    const maxRight = Math.max(...data.map((s) => s.left + s.width));
    const centerX = (minLeft + maxRight) / 2;
    const newPositions = new Map<string, Partial<ShapePositionData>>();
    data.forEach((s) => newPositions.set(s.id, { left: centerX - s.width / 2 }));
    writePositions(shapes, newPositions);
    await context.sync();
  });
}

/** Align all shapes to the topmost edge. */
export async function alignTop(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);
    const minTop = Math.min(...data.map((s) => s.top));
    const newPositions = new Map<string, Partial<ShapePositionData>>();
    data.forEach((s) => newPositions.set(s.id, { top: minTop }));
    writePositions(shapes, newPositions);
    await context.sync();
  });
}

/** Align all shapes to the bottommost edge. */
export async function alignBottom(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);
    const maxBottom = Math.max(...data.map((s) => s.top + s.height));
    const newPositions = new Map<string, Partial<ShapePositionData>>();
    data.forEach((s) => newPositions.set(s.id, { top: maxBottom - s.height }));
    writePositions(shapes, newPositions);
    await context.sync();
  });
}

/** Align all shapes to the vertical center of the bounding box. */
export async function alignMiddle(): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);
    const minTop = Math.min(...data.map((s) => s.top));
    const maxBottom = Math.max(...data.map((s) => s.top + s.height));
    const centerY = (minTop + maxBottom) / 2;
    const newPositions = new Map<string, Partial<ShapePositionData>>();
    data.forEach((s) => newPositions.set(s.id, { top: centerY - s.height / 2 }));
    writePositions(shapes, newPositions);
    await context.sync();
  });
}
