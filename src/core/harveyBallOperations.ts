/* global PowerPoint, Office */

export type HarveyBallLevel = 0 | 25 | 50 | 75 | 100;

export async function insertHarveyBall(level: HarveyBallLevel): Promise<void> {
  if (!Office.context.requirements.isSetSupported("PowerPointApi", "1.10")) {
    throw new Error(
      "Harvey ball insertion requires PowerPointApi 1.10 or later. Please update PowerPoint."
    );
  }

  await PowerPoint.run(async (context) => {
    const selectedSlides = context.presentation.getSelectedSlides();
    selectedSlides.load("items");
    await context.sync();

    const slide =
      selectedSlides.items.length > 0
        ? selectedSlides.items[0]
        : context.presentation.slides.getItemAt(0);

    const size = 22;
    const left = 480 - size / 2;
    const top = 270 - size / 2;
    const opts = { left, top, width: size, height: size };

    if (level === 0 || level === 100) {
      const shape = slide.shapes.addGeometricShape(
        PowerPoint.GeometricShapeType.ellipse,
        opts
      );
      shape.name = `Harvey Ball ${level}%`;
      shape.fill.setSolidColor(level === 100 ? "000000" : "FFFFFF");
      shape.lineFormat.color = "000000";
      shape.lineFormat.weight = 1;
      await context.sync();
    } else {
      // Background circle (white fill, black outline)
      const circle = slide.shapes.addGeometricShape(
        PowerPoint.GeometricShapeType.ellipse,
        opts
      );
      circle.fill.setSolidColor("FFFFFF");
      circle.lineFormat.color = "000000";
      circle.lineFormat.weight = 1;

      // Pie wedge for the filled portion (black fill, no outline)
      const sweepDeg = (level / 100) * 360;
      const pie = slide.shapes.addGeometricShape(
        PowerPoint.GeometricShapeType.pie,
        opts
      );
      pie.fill.setSolidColor("000000");
      pie.lineFormat.visible = false;
      pie.adjustments.set(0, 0);
      pie.adjustments.set(1, sweepDeg);
      pie.rotation = 270; // rotate so fill starts from 12 o'clock

      await context.sync();

      // Group pie + circle so they move/resize together
      const group = slide.shapes.addGroup([circle, pie]);
      group.name = `Harvey Ball ${level}%`;
      await context.sync();
    }
  });
}
