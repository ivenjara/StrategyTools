/* global PowerPoint, Office */

export type HarveyBallLevel = 0 | 25 | 50 | 75 | 100;

const imageCache = new Map<HarveyBallLevel, string>();

function buildSvg(level: HarveyBallLevel): string {
  const circle = '<circle cx="50" cy="50" r="45" stroke="black" stroke-width="4" fill="white"/>';
  let fill = "";

  if (level === 100) {
    fill = '<circle cx="50" cy="50" r="45" fill="black"/>';
  } else if (level === 25) {
    fill = '<path d="M50,50 L50,5 A45,45 0 0,1 95,50 Z" fill="black"/>';
  } else if (level === 50) {
    fill = '<path d="M50,50 L50,5 A45,45 0 1,1 50,95 Z" fill="black"/>';
  } else if (level === 75) {
    fill = '<path d="M50,50 L50,5 A45,45 0 1,1 5,50 Z" fill="black"/>';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${circle}${fill}</svg>`;
}

function renderToPng(level: HarveyBallLevel): Promise<string> {
  const cached = imageCache.get(level);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const svg = buildSvg(level);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, 200, 200);
      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
      imageCache.set(level, base64);
      resolve(base64);
    };
    img.onerror = () => reject(new Error("Failed to render Harvey ball image"));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

export async function insertHarveyBall(level: HarveyBallLevel): Promise<void> {
  if (!Office.context.requirements.isSetSupported("PowerPointApi", "1.8")) {
    throw new Error(
      "Harvey ball insertion requires PowerPointApi 1.8 or later. Please update PowerPoint."
    );
  }

  const base64 = await renderToPng(level);

  await PowerPoint.run(async (context) => {
    const selectedSlides = context.presentation.getSelectedSlides();
    selectedSlides.load("items");
    await context.sync();

    const slide =
      selectedSlides.items.length > 0
        ? selectedSlides.items[0]
        : context.presentation.slides.getItemAt(0);

    const size = 22;
    const shape = slide.shapes.addGeometricShape(PowerPoint.GeometricShapeType.ellipse, {
      left: 480 - size / 2,
      top: 270 - size / 2,
      width: size,
      height: size,
    });

    shape.name = `Harvey Ball ${level}%`;
    shape.fill.setImage(base64);
    shape.lineFormat.visible = false;

    await context.sync();
  });
}
