/* global PowerPoint, Office */

/** Strong red — readable on white slides without being neon. */
const WIP_RED = "C0392B";
const BANNER_HEIGHT = 28;
const FALLBACK_SLIDE_WIDTH = 960; // 13.333" widescreen, in points

/**
 * Adds a level, full-width red "WIP" banner across the top edge of
 * every selected slide. Returns the number of slides stamped.
 */
export async function insertWipBanner(): Promise<number> {
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

    for (const slide of selectedSlides.items) {
      const banner = slide.shapes.addTextBox("WIP", {
        left: 0,
        top: 0,
        width: slideWidth,
        height: BANNER_HEIGHT,
      });
      banner.name = "WIP banner";
      banner.fill.setSolidColor(WIP_RED);
      banner.lineFormat.visible = false;

      const textFrame = banner.textFrame;
      textFrame.autoSizeSetting = "AutoSizeNone";
      textFrame.verticalAlignment = "Middle";
      textFrame.topMargin = 0;
      textFrame.bottomMargin = 0;

      const textRange = textFrame.textRange;
      textRange.font.color = "FFFFFF";
      textRange.font.bold = true;
      textRange.font.size = 16;
      textRange.paragraphFormat.horizontalAlignment = "Center";
    }
    await context.sync();

    return selectedSlides.items.length;
  });
}
