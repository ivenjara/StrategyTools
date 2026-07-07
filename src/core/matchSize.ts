/* global PowerPoint */

import { ShapePositionData } from "./types";
import { loadSelectedShapes, writePositionsWithRefresh } from "./shapeHelpers";

export type MatchDimension = "width" | "height" | "both";

/**
 * Resizes all selected shapes to match the last-selected shape's
 * width, height, or both.
 */
export async function matchSize(dimension: MatchDimension): Promise<void> {
  await PowerPoint.run(async (context) => {
    const { shapes, data } = await loadSelectedShapes(context, 2);

    const reference = data[data.length - 1];
    const newPositions = new Map<string, Partial<ShapePositionData>>();

    for (let i = 0; i < data.length - 1; i++) {
      const update: Partial<ShapePositionData> = {};
      if (dimension === "width" || dimension === "both") update.width = reference.width;
      if (dimension === "height" || dimension === "both") update.height = reference.height;
      newPositions.set(data[i].id, update);
    }

    await writePositionsWithRefresh(shapes, newPositions, context);
  });
}
