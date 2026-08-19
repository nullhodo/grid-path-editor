import type p5 from "p5";

/**
 * Applies a Halftone Dot Screen effect.
 * Samples source image luminance and converts color intensities into rotated dot screen patterns.
 */
let lastHalftoneKey = "";

export function renderHalftoneScreenOverlay(
  _p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  dotSize: number,
  angleDeg: number,
): void {
  if (dotSize <= 1) return;

  const currentKey = `${dotSize}_${angleDeg}_${canvasWidth}x${canvasHeight}`;
  if (currentKey !== lastHalftoneKey) {
    lastHalftoneKey = currentKey;
    console.log(
      `[HalftoneOverlay] Parameter updated: dotSize=${dotSize}, angleDeg=${angleDeg}`,
    );
  }

  targetBuffer.push();

  const srcCanvas =
    (targetBuffer as unknown as { canvas?: HTMLCanvasElement }).canvas ||
    (targetBuffer as unknown as { elt?: HTMLCanvasElement }).elt;

  const srcCtx =
    (
      targetBuffer as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      }
    ).drawingContext ||
    (srcCanvas?.getContext("2d") ?? null);

  if (!srcCtx || !srcCanvas) {
    targetBuffer.pop();
    return;
  }

  const offCanvas = document.createElement("canvas");
  offCanvas.width = canvasWidth;
  offCanvas.height = canvasHeight;
  const offCtx = offCanvas.getContext("2d");
  if (!offCtx) {
    targetBuffer.pop();
    return;
  }

  offCtx.drawImage(srcCanvas, 0, 0);
  const imgData = offCtx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixels = imgData.data;

  targetBuffer.background(255);
  targetBuffer.noStroke();
  targetBuffer.fill(20);

  const rad = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const step = Math.max(3, dotSize);
  const maxR = step * 0.75;

  const diag = Math.hypot(canvasWidth, canvasHeight);
  const halfDiag = diag / 2;
  const startPos = -halfDiag;
  const endPos = halfDiag;

  const centerCX = canvasWidth / 2;
  const centerCY = canvasHeight / 2;

  for (let gy = startPos; gy <= endPos; gy += step) {
    for (let gx = startPos; gx <= endPos; gx += step) {
      // Rotate grid coordinate relative to center
      const cx = gx * cosA - gy * sinA + centerCX;
      const cy = gx * sinA + gy * cosA + centerCY;

      // Skip dots outside visible canvas bounds
      if (
        cx < -maxR ||
        cx > canvasWidth + maxR ||
        cy < -maxR ||
        cy > canvasHeight + maxR
      ) {
        continue;
      }

      const px = Math.floor(Math.max(0, Math.min(canvasWidth - 1, cx)));
      const py = Math.floor(Math.max(0, Math.min(canvasHeight - 1, cy)));
      const idx = (py * canvasWidth + px) * 4;

      const red = pixels[idx] || 0;
      const green = pixels[idx + 1] || 0;
      const blue = pixels[idx + 2] || 0;

      const brightnessNorm =
        (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
      const darknessNorm = 1.0 - brightnessNorm;

      if (darknessNorm > 0.03) {
        const radius = maxR * Math.sqrt(darknessNorm);
        targetBuffer.fill(red, green, blue);
        targetBuffer.circle(cx, cy, radius * 2);
      }
    }
  }

  targetBuffer.pop();
}
