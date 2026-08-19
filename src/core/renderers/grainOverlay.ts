import type p5 from "p5";
import { getIndexedNoise } from "../../utils/noiseUtils";

let cachedGrainCanvas: HTMLCanvasElement | null = null;
let cachedWidth = 0;
let cachedHeight = 0;

/**
 * Generates or retrieves a cached monochromatic noise texture canvas for high-performance film grain overlay.
 */
function getGrainNoiseCanvas(
  width: number,
  height: number,
): HTMLCanvasElement {
  if (
    cachedGrainCanvas &&
    cachedWidth === width &&
    cachedHeight === height
  ) {
    return cachedGrainCanvas;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Static monochromatic noise with deterministic PRNG
      const noise = Math.floor(getIndexedNoise(i / 4, 9999) * 255);
      data[i] = noise; // Red
      data[i + 1] = noise; // Green
      data[i + 2] = noise; // Blue
      data[i + 3] = 255; // Alpha
    }

    ctx.putImageData(imageData, 0, 0);
  }

  cachedGrainCanvas = canvas;
  cachedWidth = width;
  cachedHeight = height;
  return canvas;
}

/**
 * Renders an organic film grain / paper texture noise overlay on top of the graphics context.
 * @param targetGraphics - Main p5 instance or target graphics buffer.
 * @param width - Canvas width.
 * @param height - Canvas height.
 * @param intensity - Grain intensity ratio (0.0 = none, 0.5 = heavy).
 */
export function renderGrainOverlay(
  targetGraphics: p5 | p5.Graphics,
  width: number,
  height: number,
  intensity: number,
): void {
  if (intensity <= 0.001) return;

  const rawGraphics = targetGraphics as unknown as {
    drawingContext?: CanvasRenderingContext2D;
  };
  const ctx = rawGraphics.drawingContext;

  if (ctx) {
    const noiseCanvas = getGrainNoiseCanvas(width, height);

    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = Math.min(0.6, intensity);

    ctx.drawImage(noiseCanvas, 0, 0, width, height);
    ctx.restore();
  } else {
    // Fallback p5 tint blend
    targetGraphics.push();
    targetGraphics.tint(255, Math.min(255, intensity * 255 * 1.5));
    targetGraphics.image(
      getGrainNoiseCanvas(width, height) as unknown as p5.Image,
      0,
      0,
    );
    targetGraphics.pop();
  }
}
