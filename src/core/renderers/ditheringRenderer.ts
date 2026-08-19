import type p5 from "p5";

// Standard 8x8 Bayer Dithering Matrix (normalized to 0..1)
const BAYER_MATRIX_8X8: number[][] = [
  [0 / 64, 32 / 64, 8 / 64, 40 / 64, 2 / 64, 34 / 64, 10 / 64, 42 / 64],
  [48 / 64, 16 / 64, 56 / 64, 24 / 64, 50 / 64, 18 / 64, 58 / 64, 26 / 64],
  [12 / 64, 44 / 64, 4 / 64, 36 / 64, 14 / 64, 46 / 64, 6 / 64, 38 / 64],
  [60 / 64, 28 / 64, 52 / 64, 20 / 64, 62 / 64, 30 / 64, 54 / 64, 22 / 64],
  [3 / 64, 35 / 64, 11 / 64, 43 / 64, 1 / 64, 33 / 64, 9 / 64, 41 / 64],
  [51 / 64, 19 / 64, 59 / 64, 27 / 64, 49 / 64, 17 / 64, 57 / 64, 25 / 64],
  [15 / 64, 47 / 64, 7 / 64, 39 / 64, 13 / 64, 45 / 64, 5 / 64, 37 / 64],
  [63 / 64, 31 / 64, 55 / 64, 23 / 64, 61 / 64, 29 / 64, 53 / 64, 21 / 64],
];

/**
 * Applies an 8x8 Bayer Matrix Dithering effect.
 */
let lastDitheringKey = "";

export function renderDitheringOverlay(
  _p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  levels: number,
): void {
  const pixelScale = Math.max(1, Math.floor(scale));
  const steps = Math.max(2, Math.floor(levels));

  const currentKey = `${pixelScale}_${steps}_${canvasWidth}x${canvasHeight}`;
  if (currentKey !== lastDitheringKey) {
    lastDitheringKey = currentKey;
    console.log(
      `[DitheringOverlay] Parameter updated: scale=${pixelScale}, levels=${steps}`,
    );
  }

  targetBuffer.push();

  const srcCanvas =
    (targetBuffer as unknown as { canvas?: HTMLCanvasElement }).canvas ||
    (targetBuffer as unknown as { elt?: HTMLCanvasElement }).elt;

  const targetCtx =
    (
      targetBuffer as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      }
    ).drawingContext ||
    (srcCanvas?.getContext("2d") ?? null);

  if (!targetCtx || !srcCanvas) {
    targetBuffer.pop();
    return;
  }

  const w = Math.ceil(canvasWidth / pixelScale);
  const h = Math.ceil(canvasHeight / pixelScale);

  const offCanvas = document.createElement("canvas");
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext("2d");
  if (!offCtx) {
    targetBuffer.pop();
    return;
  }

  offCtx.drawImage(srcCanvas, 0, 0, w, h);
  const imgData = offCtx.getImageData(0, 0, w, h);
  const pixels = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      const bayerVal = BAYER_MATRIX_8X8[y % 8][x % 8] - 0.5;

      const normR = r / 255;
      const normG = g / 255;
      const normB = b / 255;

      const ditherR = Math.max(
        0,
        Math.min(
          1,
          Math.floor((normR + bayerVal / steps) * steps) / (steps - 1),
        ),
      );
      const ditherG = Math.max(
        0,
        Math.min(
          1,
          Math.floor((normG + bayerVal / steps) * steps) / (steps - 1),
        ),
      );
      const ditherB = Math.max(
        0,
        Math.min(
          1,
          Math.floor((normB + bayerVal / steps) * steps) / (steps - 1),
        ),
      );

      pixels[idx] = Math.round(ditherR * 255);
      pixels[idx + 1] = Math.round(ditherG * 255);
      pixels[idx + 2] = Math.round(ditherB * 255);
    }
  }

  offCtx.putImageData(imgData, 0, 0);

  targetCtx.save();
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.drawImage(offCanvas, 0, 0, canvasWidth, canvasHeight);
  targetCtx.restore();

  targetBuffer.pop();
}
