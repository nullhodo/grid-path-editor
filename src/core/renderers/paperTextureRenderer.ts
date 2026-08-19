import type p5 from "p5";
import { getStaticNoise } from "../../utils/noiseUtils";

/**
 * Applies a Procedural Paper Texture Bump & Fiber effect.
 * Generates organic paper fiber noise and subtle directional bump shading.
 */
let lastPaperKey = "";

export function renderPaperTextureOverlay(
  _p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  roughness: number,
  density: number,
): void {
  if (roughness <= 0 && density <= 0) return;

  const currentKey = `${roughness}_${density}_${canvasWidth}x${canvasHeight}`;
  if (currentKey !== lastPaperKey) {
    lastPaperKey = currentKey;
    console.log(
      `[PaperTextureOverlay] Parameter updated: roughness=${roughness}, density=${density}`,
    );
  }

  targetBuffer.push();

  const srcCanvas =
    (targetBuffer as unknown as { canvas?: HTMLCanvasElement }).canvas ||
    (targetBuffer as unknown as { elt?: HTMLCanvasElement }).elt;

  const ctx =
    (
      targetBuffer as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      }
    ).drawingContext ||
    (srcCanvas?.getContext("2d") ?? null);

  if (!ctx || !srcCanvas) {
    targetBuffer.pop();
    return;
  }

  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = canvasWidth;
  textureCanvas.height = canvasHeight;
  const textureCtx = textureCanvas.getContext("2d");

  if (!textureCtx) {
    targetBuffer.pop();
    return;
  }

  textureCtx.fillStyle = "rgb(245, 242, 235)";
  textureCtx.fillRect(0, 0, canvasWidth, canvasHeight);

  const imgData = textureCtx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixels = imgData.data;

  const numPixels = canvasWidth * canvasHeight;
  const fiberAlpha = Math.floor(Math.min(180, 255 * roughness * 0.4));
  const bumpAlpha = Math.floor(Math.min(140, 255 * density * 0.5));

  for (let i = 0; i < numPixels; i++) {
    const idx = i * 4;
    const x = i % canvasWidth;
    const y = Math.floor(i / canvasWidth);

    const n =
      Math.sin(x * 0.05 + y * 0.02) * Math.cos(x * 0.02 - y * 0.05);
    const rnd = getStaticNoise(x, y);
    const noiseVal = rnd * fiberAlpha + n * bumpAlpha;

    pixels[idx] = Math.max(0, pixels[idx] - noiseVal * 0.7);
    pixels[idx + 1] = Math.max(0, pixels[idx + 1] - noiseVal * 0.7);
    pixels[idx + 2] = Math.max(0, pixels[idx + 2] - noiseVal * 0.6);
  }

  textureCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = Math.min(0.95, (180 + Math.floor(density * 75)) / 255);
  ctx.drawImage(textureCanvas, 0, 0);
  ctx.restore();

  targetBuffer.pop();
}
