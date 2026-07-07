/* global PowerPoint */

import { TEXT_CAPABLE_SHAPE_TYPES } from "./shapeHelpers";

export const CM_TO_PT = 28.3465;

export interface MarginsCm {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Applies the given internal text margins (in cm) to all selected shapes
 * that can hold text. Returns the number of shapes updated.
 */
export async function applyTextMargins(margins: MarginsCm): Promise<number> {
  return PowerPoint.run(async (context) => {
    const selected = context.presentation.getSelectedShapes();
    const count = selected.getCount();
    selected.load("items/id,items/type");
    await context.sync();

    if (count.value < 1) {
      throw new Error("Select at least 1 shape.");
    }

    const textShapes = selected.items.filter((s) => TEXT_CAPABLE_SHAPE_TYPES.has(s.type));
    if (textShapes.length === 0) {
      throw new Error("None of the selected shapes can hold text.");
    }

    for (const shape of textShapes) {
      const textFrame = shape.textFrame;
      textFrame.leftMargin = margins.left * CM_TO_PT;
      textFrame.rightMargin = margins.right * CM_TO_PT;
      textFrame.topMargin = margins.top * CM_TO_PT;
      textFrame.bottomMargin = margins.bottom * CM_TO_PT;
    }
    await context.sync();

    return textShapes.length;
  });
}
