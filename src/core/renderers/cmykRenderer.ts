import type p5 from "p5";

/**
 * Applies a 4-color CMYK plate separation and misregistration print overlay effect:
 * 1. Decomposes artwork pixels into Cyan, Magenta, Yellow, and Key(Black) subtractive channels.
 * 2. Creates separate transparent ink plates with real process ink pigments.
 * 3. Applies multi-directional misregistration offsets scaled by offsetFactor.
 * 4. Blends the plates onto the background with subtractive multiply composite.
 */
let lastCmykLogKey = "";

function parseHexColor(
  hex?: string,
): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== "string") return null;
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (clean.length === 6) {
    const num = Number.parseInt(clean, 16);
    if (!Number.isNaN(num)) {
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    }
  }
  return null;
}

export function renderCmykPrintOverlay(
  _p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  offsetFactor = 0.35,
  intensity = 0.9,
  backgroundColor?: string,
): void {
  if (offsetFactor <= 0 && intensity <= 0) return;

  const currentLogKey = `${offsetFactor.toFixed(2)}_${intensity.toFixed(2)}_${canvasWidth}x${canvasHeight}_${backgroundColor || ""}`;
  if (currentLogKey !== lastCmykLogKey) {
    lastCmykLogKey = currentLogKey;
    console.log(
      `[CmykPrintOverlay] Parameter updated: offsetFactor=${offsetFactor}, intensity=${intensity}`,
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

  if (ctx && srcCanvas) {
    const srcCtx = srcCanvas.getContext("2d");

    if (srcCtx) {
      const imgData = srcCtx.getImageData(0, 0, canvasWidth, canvasHeight);
      const pixels = imgData.data;

      // Determine background color
      const parsedBg = parseHexColor(backgroundColor);
      const bgR = parsedBg ? parsedBg.r : pixels[0];
      const bgG = parsedBg ? parsedBg.g : pixels[1];
      const bgB = parsedBg ? parsedBg.b : pixels[2];

      // Create 4 plate canvases
      const cCanvas = document.createElement("canvas");
      cCanvas.width = canvasWidth;
      cCanvas.height = canvasHeight;
      const cCtx = cCanvas.getContext("2d");

      const mCanvas = document.createElement("canvas");
      mCanvas.width = canvasWidth;
      mCanvas.height = canvasHeight;
      const mCtx = mCanvas.getContext("2d");

      const yCanvas = document.createElement("canvas");
      yCanvas.width = canvasWidth;
      yCanvas.height = canvasHeight;
      const yCtx = yCanvas.getContext("2d");

      const kCanvas = document.createElement("canvas");
      kCanvas.width = canvasWidth;
      kCanvas.height = canvasHeight;
      const kCtx = kCanvas.getContext("2d");

      if (cCtx && mCtx && yCtx && kCtx) {
        const cImg = cCtx.createImageData(canvasWidth, canvasHeight);
        const mImg = mCtx.createImageData(canvasWidth, canvasHeight);
        const yImg = yCtx.createImageData(canvasWidth, canvasHeight);
        const kImg = kCtx.createImageData(canvasWidth, canvasHeight);

        const cData = cImg.data;
        const mData = mImg.data;
        const yData = yImg.data;
        const kData = kImg.data;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          if (a <= 5) continue;

          // Check if pixel belongs to foreground artwork
          const diffR = Math.abs(r - bgR);
          const diffG = Math.abs(g - bgG);
          const diffB = Math.abs(b - bgB);
          const isArtwork = diffR + diffG + diffB > 15;

          if (isArtwork) {
            const rNorm = r / 255;
            const gNorm = g / 255;
            const bNorm = b / 255;
            const aNorm = a / 255;

            // RGB to CMYK decomposition
            const kVal = 1 - Math.max(rNorm, gNorm, bNorm);
            let cVal = 0;
            let mVal = 0;
            let yVal = 0;

            if (kVal < 0.9999) {
              cVal = (1 - rNorm - kVal) / (1 - kVal);
              mVal = (1 - gNorm - kVal) / (1 - kVal);
              yVal = (1 - bNorm - kVal) / (1 - kVal);
            }

            const clampedIntensity = Math.max(
              0.1,
              Math.min(1.0, intensity),
            );

            // Cyan Plate (#009FE3 / Process Cyan)
            if (cVal > 0.01) {
              cData[i] = 0;
              cData[i + 1] = 159;
              cData[i + 2] = 227;
              cData[i + 3] = Math.round(
                cVal * aNorm * 255 * clampedIntensity,
              );
            }

            // Magenta Plate (#E4007F / Process Magenta)
            if (mVal > 0.01) {
              mData[i] = 228;
              mData[i + 1] = 0;
              mData[i + 2] = 127;
              mData[i + 3] = Math.round(
                mVal * aNorm * 255 * clampedIntensity,
              );
            }

            // Yellow Plate (#FFED00 / Process Yellow)
            if (yVal > 0.01) {
              yData[i] = 255;
              yData[i + 1] = 237;
              yData[i + 2] = 0;
              yData[i + 3] = Math.round(
                yVal * aNorm * 255 * clampedIntensity,
              );
            }

            // Key/Black Plate (#181818 / Process Black)
            if (kVal > 0.01) {
              kData[i] = 24;
              kData[i + 1] = 24;
              kData[i + 2] = 24;
              kData[i + 3] = Math.round(
                kVal * aNorm * 255 * clampedIntensity,
              );
            }
          }
        }

        cCtx.putImageData(cImg, 0, 0);
        mCtx.putImageData(mImg, 0, 0);
        yCtx.putImageData(yImg, 0, 0);
        kCtx.putImageData(kImg, 0, 0);

        // Calculate independent angular misregistration offsets based on offsetFactor
        const dist = offsetFactor * (canvasWidth * 0.015);

        const cx = Math.cos(Math.PI * 0.25) * dist * 1.1;
        const cy = Math.sin(Math.PI * 0.25) * dist * 1.1;

        const mx = Math.cos(Math.PI * 0.85) * dist * 0.95;
        const my = Math.sin(Math.PI * 0.85) * dist * 0.95;

        const yx = Math.cos(Math.PI * 1.55) * dist * 1.2;
        const yy = Math.sin(Math.PI * 1.55) * dist * 1.2;

        const kx = Math.cos(Math.PI * 1.95) * dist * 0.5;
        const ky = Math.sin(Math.PI * 1.95) * dist * 0.5;

        // Create composite background canvas
        const compositeCanvas = document.createElement("canvas");
        compositeCanvas.width = canvasWidth;
        compositeCanvas.height = canvasHeight;
        const compCtx = compositeCanvas.getContext("2d");

        if (compCtx) {
          // Draw solid background color
          compCtx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
          compCtx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Subtractive multiply blending of CMYK ink layers
          compCtx.save();
          compCtx.globalCompositeOperation = "multiply";
          compCtx.drawImage(cCanvas, cx, cy);
          compCtx.drawImage(mCanvas, mx, my);
          compCtx.drawImage(yCanvas, yx, yy);
          compCtx.drawImage(kCanvas, kx, ky);
          compCtx.restore();

          // Render finished CMYK print onto target buffer
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.drawImage(compositeCanvas, 0, 0);
          ctx.restore();
        }
      }
    }
  }

  targetBuffer.pop();
}
