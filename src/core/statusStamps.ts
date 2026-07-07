/* global PowerPoint, Office */

export type StampKind = "WIP" | "FINAL" | "CONFIDENTIAL";

/**
 * Stamp colors are darker variants of the pane's semantic tokens so the
 * pills stay legible on typical white slide backgrounds.
 */
const STAMP_COLORS: Record<StampKind, string> = {
  WIP: "C07B10",
  FINAL: "1F8A4D",
  CONFIDENTIAL: "C0392B",
};

const SLIDE_MARGIN = 16;
const FALLBACK_SLIDE_WIDTH = 960; // 13.333" widescreen, in points

/**
 * Inserts a bordered status pill at the top-right corner of every
 * selected slide. Returns the number of slides stamped.
 */
export async function insertStatusStamp(kind: StampKind): Promise<number> {
  const has110 = Office.context.requirements.isSetSupported("PowerPointApi", "1.10");

  return PowerPoint.run(async (context) => {
    const selectedSlides = context.presentation.getSelectedSlides();
    selectedSlides.load("items");
    await context.sync();

    if (selectedSlides.items.length === 0) {
      throw new Error("Select at least one slide to stamp.");
    }

    let slideWidth = FALLBACK_SLIDE_WIDTH;
    if (has110) {
      const pageSetup = context.presentation.pageSetup;
      pageSetup.load("slideWidth");
      await context.sync();
      slideWidth = pageSetup.slideWidth;
    }

    const color = STAMP_COLORS[kind];
    const stamps: PowerPoint.Shape[] = [];

    for (const slide of selectedSlides.items) {
      const estimatedWidth = 30 + kind.length * 9;
      const box = slide.shapes.addTextBox(kind, {
        left: slideWidth - estimatedWidth - SLIDE_MARGIN,
        top: SLIDE_MARGIN,
        width: estimatedWidth,
        height: 24,
      });
      box.name = `Stamp ${kind}`;
      box.fill.clear();
      box.lineFormat.visible = true;
      box.lineFormat.color = color;
      box.lineFormat.weight = 1.5;

      const textFrame = box.textFrame;
      textFrame.wordWrap = false;
      textFrame.autoSizeSetting = "AutoSizeShapeToFitText";
      textFrame.leftMargin = 6;
      textFrame.rightMargin = 6;
      textFrame.topMargin = 2.25;
      textFrame.bottomMargin = 2.25;

      const textRange = textFrame.textRange;
      textRange.font.color = color;
      textRange.font.bold = true;
      textRange.font.size = 12;
      textRange.paragraphFormat.horizontalAlignment = "Center";

      stamps.push(box);
    }
    await context.sync();

    // Autosize may have changed the width — re-anchor the right edge, then rotate.
    for (const stamp of stamps) {
      stamp.load("width");
    }
    await context.sync();

    for (const stamp of stamps) {
      stamp.left = slideWidth - stamp.width - SLIDE_MARGIN;
      if (has110) {
        stamp.rotation = -4;
      }
    }
    await context.sync();

    return stamps.length;
  });
}
