/* global PowerPoint */

import { TEXT_CAPABLE_SHAPE_TYPES } from "./shapeHelpers";

export type StyleAspect = "fill" | "border" | "font" | "all";

/**
 * Copies formatting from the last-selected (reference) shape to all
 * other selected shapes. Properties that read back as null (mixed
 * formatting, invisible borders) are skipped.
 */
export async function makeSame(aspect: StyleAspect): Promise<void> {
  await PowerPoint.run(async (context) => {
    const selected = context.presentation.getSelectedShapes();
    const count = selected.getCount();
    selected.load("items/id,items/type");
    await context.sync();

    if (count.value < 2) {
      throw new Error(`Select at least 2 shapes — the last-selected shape is the reference. You selected ${count.value}.`);
    }

    const items = selected.items;
    const reference = items[items.length - 1];
    const targets = items.slice(0, -1);

    const wantFill = aspect === "fill" || aspect === "all";
    const wantBorder = aspect === "border" || aspect === "all";
    const wantFont = aspect === "font" || aspect === "all";
    const referenceHasText = TEXT_CAPABLE_SHAPE_TYPES.has(reference.type);

    if (wantFill) reference.fill.load("type,foregroundColor,transparency");
    if (wantBorder) reference.lineFormat.load("color,dashStyle,style,transparency,visible,weight");
    if (wantFont && referenceHasText) {
      reference.textFrame.textRange.font.load("name,size,color,bold,italic,underline");
    }
    await context.sync();

    if (aspect === "font" && !referenceHasText) {
      throw new Error("The reference (last-selected) shape can't hold text.");
    }

    if (wantFill) {
      const fill = reference.fill;
      if (fill.type === "Solid") {
        for (const target of targets) {
          target.fill.setSolidColor(fill.foregroundColor);
          if (fill.transparency !== null && fill.transparency !== undefined) {
            target.fill.transparency = fill.transparency;
          }
        }
      } else if (fill.type === "NoFill") {
        for (const target of targets) {
          target.fill.clear();
        }
      } else if (aspect === "fill") {
        throw new Error("Reference fill type not supported — use a shape with a solid fill or no fill.");
      }
    }

    if (wantBorder) {
      const line = reference.lineFormat;
      for (const target of targets) {
        if (line.visible !== null && line.visible !== undefined) {
          target.lineFormat.visible = line.visible;
        }
        if (line.visible) {
          if (line.color) target.lineFormat.color = line.color;
          if (line.weight !== null && line.weight !== undefined && line.weight >= 0) {
            target.lineFormat.weight = line.weight;
          }
          if (line.dashStyle) target.lineFormat.dashStyle = line.dashStyle;
          if (line.style) target.lineFormat.style = line.style;
          if (line.transparency !== null && line.transparency !== undefined) {
            target.lineFormat.transparency = line.transparency;
          }
        }
      }
    }

    if (wantFont && referenceHasText) {
      const font = reference.textFrame.textRange.font;
      for (const target of targets) {
        if (!TEXT_CAPABLE_SHAPE_TYPES.has(target.type)) continue;
        const targetFont = target.textFrame.textRange.font;
        if (font.name) targetFont.name = font.name;
        if (font.size !== null && font.size !== undefined) targetFont.size = font.size;
        if (font.color) targetFont.color = font.color;
        if (font.bold !== null && font.bold !== undefined) targetFont.bold = font.bold;
        if (font.italic !== null && font.italic !== undefined) targetFont.italic = font.italic;
        if (font.underline) targetFont.underline = font.underline;
      }
    }

    await context.sync();
  });
}
