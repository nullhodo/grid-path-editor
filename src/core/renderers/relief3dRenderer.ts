import type p5 from "p5";
import type { PathChain, SketchParameters } from "../../types/sketch";
import { getLayoutMetrics } from "./layoutHelper";

// Elevation constants (Strictly: Outer Envelope > Core > Grid Lines > Background)
const ELEVATION_OUTER = 1.0;
const ELEVATION_DOT = 0.75;
const ELEVATION_CORE = 0.6;
const ELEVATION_GRID = 0.25;

let lastReliefLogKey = "";

/**
 * 2-pass Euclidean/Chamfer distance transform on binary mask.
 * Computes distance from each foreground pixel to the nearest edge (background).
 */
function computeDistanceToEdge(
  mask: Uint8Array,
  width: number,
  height: number,
  maxDist: number,
): Float32Array {
  const dist = new Float32Array(width * height);
  const INF = 999999.0;

  // Initialize
  for (let i = 0; i < mask.length; i++) {
    dist[i] = mask[i] > 0 ? INF : 0.0;
  }

  // Pass 1: Top-Left to Bottom-Right
  for (let y = 0; y < height; y++) {
    const yOff = y * width;
    for (let x = 0; x < width; x++) {
      const idx = yOff + x;
      if (dist[idx] === 0) continue;

      let d = dist[idx];
      if (x > 0) d = Math.min(d, dist[idx - 1] + 1.0);
      if (y > 0) d = Math.min(d, dist[idx - width] + 1.0);
      if (x > 0 && y > 0)
        d = Math.min(d, dist[idx - width - 1] + Math.SQRT2);
      if (x < width - 1 && y > 0)
        d = Math.min(d, dist[idx - width + 1] + Math.SQRT2);

      dist[idx] = d;
    }
  }

  // Pass 2: Bottom-Right to Top-Left
  for (let y = height - 1; y >= 0; y--) {
    const yOff = y * width;
    for (let x = width - 1; x >= 0; x--) {
      const idx = yOff + x;
      if (dist[idx] === 0) continue;

      let d = dist[idx];
      if (x < width - 1) d = Math.min(d, dist[idx + 1] + 1.0);
      if (y < height - 1) d = Math.min(d, dist[idx + width] + 1.0);
      if (x < width - 1 && y < height - 1)
        d = Math.min(d, dist[idx + width + 1] + Math.SQRT2);
      if (x > 0 && y < height - 1)
        d = Math.min(d, dist[idx + width - 1] + Math.SQRT2);

      dist[idx] = Math.min(d, maxDist);
    }
  }

  return dist;
}

/**
 * Draws elements cleanly to offscreen 2D context using exact geometry.
 */
function renderElementMasks(
  canvasWidth: number,
  canvasHeight: number,
  params: SketchParameters,
  pathGroupList: PathChain[],
): {
  outerMask: Uint8Array;
  coreMask: Uint8Array;
  gridMask: Uint8Array;
  dotMask: Uint8Array;
  outerHalfWidth: number;
  coreHalfWidth: number;
  gridHalfWidth: number;
} {
  const { paddingHorizontal, paddingVertical, cellWidth, cellHeight } =
    getLayoutMetrics(canvasWidth, canvasHeight, params);

  const outerTubeStrokeWeight =
    Math.min(cellWidth, cellHeight) * params.tubeWidthRatio;
  const innerTubeStrokeWeight =
    outerTubeStrokeWeight * params.tubeInnerRatio;
  const outerBandWidth = Math.max(
    1,
    (outerTubeStrokeWeight - innerTubeStrokeWeight) / 2.0,
  );
  const outerHalfWidth = outerBandWidth / 2.0;

  const coreHalfWidth = Math.max(1, params.coreLineWidth / 2.0);
  const gridHalfWidth = Math.max(1, params.gridLineWidth / 2.0);

  const numPixels = canvasWidth * canvasHeight;

  // 1. Grid Mask Canvas
  const gridCanvas = document.createElement("canvas");
  gridCanvas.width = canvasWidth;
  gridCanvas.height = canvasHeight;
  const gridCtx = gridCanvas.getContext("2d");

  if (gridCtx && params.showGridLines && params.gridLineWidth > 0) {
    gridCtx.strokeStyle = "#FFFFFF";
    gridCtx.lineWidth = params.gridLineWidth;
    gridCtx.lineCap = "butt";
    gridCtx.lineJoin = "miter";

    const usableWidth = cellWidth * params.gridColumns;
    const usableHeight = cellHeight * params.gridRows;

    if (params.showGridInnerHorizontal) {
      for (let r = 1; r < params.gridRows; r++) {
        const y = paddingVertical + r * cellHeight;
        gridCtx.beginPath();
        gridCtx.moveTo(paddingHorizontal, y);
        gridCtx.lineTo(paddingHorizontal + usableWidth, y);
        gridCtx.stroke();
      }
    }
    if (params.showGridInnerVertical) {
      for (let c = 1; c < params.gridColumns; c++) {
        const x = paddingHorizontal + c * cellWidth;
        gridCtx.beginPath();
        gridCtx.moveTo(x, paddingVertical);
        gridCtx.lineTo(x, paddingVertical + usableHeight);
        gridCtx.stroke();
      }
    }
    if (params.showGridCenterHorizontal) {
      for (let r = 0; r < params.gridRows; r++) {
        const y = paddingVertical + (r + 0.5) * cellHeight;
        gridCtx.beginPath();
        gridCtx.moveTo(paddingHorizontal, y);
        gridCtx.lineTo(paddingHorizontal + usableWidth, y);
        gridCtx.stroke();
      }
    }
    if (params.showGridCenterVertical) {
      for (let c = 0; c < params.gridColumns; c++) {
        const x = paddingHorizontal + (c + 0.5) * cellWidth;
        gridCtx.beginPath();
        gridCtx.moveTo(x, paddingVertical);
        gridCtx.lineTo(x, paddingVertical + usableHeight);
        gridCtx.stroke();
      }
    }
    if (params.showGridOuterBorder) {
      gridCtx.strokeRect(
        paddingHorizontal,
        paddingVertical,
        usableWidth,
        usableHeight,
      );
    }
  }

  // 2. Outer Envelope Mask (Outer stroke minus Inner cavity stroke)
  const outerCanvas = document.createElement("canvas");
  outerCanvas.width = canvasWidth;
  outerCanvas.height = canvasHeight;
  const outerCtx = outerCanvas.getContext("2d");

  // 3. Core Mask Canvas
  const coreCanvas = document.createElement("canvas");
  coreCanvas.width = canvasWidth;
  coreCanvas.height = canvasHeight;
  const coreCtx = coreCanvas.getContext("2d");

  // 4. Dot Mask Canvas
  const dotCanvas = document.createElement("canvas");
  dotCanvas.width = canvasWidth;
  dotCanvas.height = canvasHeight;
  const dotCtx = dotCanvas.getContext("2d");

  // Helper to trace vector paths with smooth corners on a 2D context
  const traceChainPath = (
    ctx: CanvasRenderingContext2D,
    chain: PathChain,
  ) => {
    if (chain.length === 0) return;
    const roundnessFactor = params.cornerRoundnessPercent / 100.0;
    const maxCornerRadius =
      Math.min(cellWidth, cellHeight) * 0.45 * roundnessFactor;

    ctx.beginPath();
    const first = chain[0];
    ctx.moveTo(
      paddingHorizontal + (first.columnIndex + 0.5) * cellWidth,
      paddingVertical + (first.rowIndex + 0.5) * cellHeight,
    );

    if (chain.length === 1 || maxCornerRadius <= 0.001) {
      for (let i = 1; i < chain.length; i++) {
        const node = chain[i];
        ctx.lineTo(
          paddingHorizontal + (node.columnIndex + 0.5) * cellWidth,
          paddingVertical + (node.rowIndex + 0.5) * cellHeight,
        );
      }
      return;
    }

    for (let i = 1; i < chain.length - 1; i++) {
      const prev = chain[i - 1];
      const curr = chain[i];
      const next = chain[i + 1];

      const pX = paddingHorizontal + (prev.columnIndex + 0.5) * cellWidth;
      const pY = paddingVertical + (prev.rowIndex + 0.5) * cellHeight;
      const cX = paddingHorizontal + (curr.columnIndex + 0.5) * cellWidth;
      const cY = paddingVertical + (curr.rowIndex + 0.5) * cellHeight;
      const nX = paddingHorizontal + (next.columnIndex + 0.5) * cellWidth;
      const nY = paddingVertical + (next.rowIndex + 0.5) * cellHeight;

      const vInX = cX - pX;
      const vInY = cY - pY;
      const dIn = Math.sqrt(vInX * vInX + vInY * vInY);

      const vOutX = nX - cX;
      const vOutY = nY - cY;
      const dOut = Math.sqrt(vOutX * vOutX + vOutY * vOutY);

      const radius = Math.min(maxCornerRadius, dIn * 0.45, dOut * 0.45);

      if (radius <= 0.001) {
        ctx.lineTo(cX, cY);
      } else {
        const cutInX = cX - (vInX / dIn) * radius;
        const cutInY = cY - (vInY / dIn) * radius;
        const cutOutX = cX + (vOutX / dOut) * radius;
        const cutOutY = cY + (vOutY / dOut) * radius;

        ctx.lineTo(cutInX, cutInY);
        ctx.quadraticCurveTo(cX, cY, cutOutX, cutOutY);
      }
    }

    const last = chain[chain.length - 1];
    ctx.lineTo(
      paddingHorizontal + (last.columnIndex + 0.5) * cellWidth,
      paddingVertical + (last.rowIndex + 0.5) * cellHeight,
    );
  };

  const drawCaps = (
    ctx: CanvasRenderingContext2D,
    chain: PathChain,
    strokeW: number,
  ) => {
    if (chain.length < 2) return;
    const R = strokeW / 2.0;
    const p = params.tipRoundnessPercent / 100.0;
    const rTip = R * p;
    const flatH = R * (1.0 - p);
    const overlap = 1.0;
    const KAPPA = 0.5522847498;

    const renderCap = (curr: PathChain[0], adj: PathChain[0]) => {
      const cX = paddingHorizontal + (curr.columnIndex + 0.5) * cellWidth;
      const cY = paddingVertical + (curr.rowIndex + 0.5) * cellHeight;
      const aX = paddingHorizontal + (adj.columnIndex + 0.5) * cellWidth;
      const aY = paddingVertical + (adj.rowIndex + 0.5) * cellHeight;
      const angle = Math.atan2(cY - aY, cX - aX);

      ctx.save();
      ctx.translate(cX, cY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-overlap, -R);
      ctx.lineTo(R - rTip, -R);
      if (rTip > 0.001) {
        const k = rTip * KAPPA;
        ctx.bezierCurveTo(R - rTip + k, -R, R, -flatH - k, R, -flatH);
      } else {
        ctx.lineTo(R, -R);
      }
      ctx.lineTo(R, flatH);
      if (rTip > 0.001) {
        const k = rTip * KAPPA;
        ctx.bezierCurveTo(R, flatH + k, R - rTip + k, R, R - rTip, R);
      } else {
        ctx.lineTo(R, R);
      }
      ctx.lineTo(-overlap, R);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    renderCap(chain[0], chain[1]);
    renderCap(chain[chain.length - 1], chain[chain.length - 2]);
  };

  // 1b. Cutout Grid lines that lie underneath the snake body
  if (gridCtx && params.showGridLines && params.gridLineWidth > 0) {
    gridCtx.globalCompositeOperation = "destination-out";
    gridCtx.fillStyle = "#FFFFFF";
    gridCtx.strokeStyle = "#FFFFFF";
    gridCtx.lineWidth = outerTubeStrokeWeight;
    gridCtx.lineCap = "butt";
    gridCtx.lineJoin = "round";

    for (const chain of pathGroupList) {
      if (chain.length < 2) {
        if (chain.length === 1) {
          const node = chain[0];
          const cx =
            paddingHorizontal + (node.columnIndex + 0.5) * cellWidth;
          const cy = paddingVertical + (node.rowIndex + 0.5) * cellHeight;
          gridCtx.beginPath();
          gridCtx.arc(cx, cy, outerTubeStrokeWeight / 2.0, 0, Math.PI * 2);
          gridCtx.fill();
        }
        continue;
      }
      traceChainPath(gridCtx, chain);
      gridCtx.stroke();
      drawCaps(gridCtx, chain, outerTubeStrokeWeight);
    }
  }

  // 2. Outer Envelope Mask (Outer stroke minus Inner cavity stroke)
  if (outerCtx) {
    outerCtx.strokeStyle = "#FFFFFF";
    outerCtx.fillStyle = "#FFFFFF";
    outerCtx.lineWidth = outerTubeStrokeWeight;
    outerCtx.lineCap = "butt";
    outerCtx.lineJoin = "round";

    for (const chain of pathGroupList) {
      if (chain.length < 2) {
        if (chain.length === 1) {
          const node = chain[0];
          const cx =
            paddingHorizontal + (node.columnIndex + 0.5) * cellWidth;
          const cy = paddingVertical + (node.rowIndex + 0.5) * cellHeight;
          outerCtx.beginPath();
          outerCtx.arc(
            cx,
            cy,
            outerTubeStrokeWeight / 2.0,
            0,
            Math.PI * 2,
          );
          outerCtx.fill();
        }
        continue;
      }
      traceChainPath(outerCtx, chain);
      outerCtx.stroke();
      drawCaps(outerCtx, chain, outerTubeStrokeWeight);
    }

    // Cutout Inner Cavity using destination-out
    outerCtx.globalCompositeOperation = "destination-out";
    outerCtx.lineWidth = innerTubeStrokeWeight;
    for (const chain of pathGroupList) {
      if (chain.length < 2) {
        if (chain.length === 1) {
          const node = chain[0];
          const cx =
            paddingHorizontal + (node.columnIndex + 0.5) * cellWidth;
          const cy = paddingVertical + (node.rowIndex + 0.5) * cellHeight;
          outerCtx.beginPath();
          outerCtx.arc(
            cx,
            cy,
            innerTubeStrokeWeight / 2.0,
            0,
            Math.PI * 2,
          );
          outerCtx.fill();
        }
        continue;
      }
      traceChainPath(outerCtx, chain);
      outerCtx.stroke();
      drawCaps(outerCtx, chain, innerTubeStrokeWeight);
    }
  }

  // Draw Core
  if (coreCtx) {
    coreCtx.strokeStyle = "#FFFFFF";
    coreCtx.fillStyle = "#FFFFFF";
    coreCtx.lineWidth = params.coreLineWidth;
    coreCtx.lineCap = "butt";
    coreCtx.lineJoin = "round";

    for (const chain of pathGroupList) {
      if (chain.length < 2) {
        if (chain.length === 1) {
          const node = chain[0];
          const cx =
            paddingHorizontal + (node.columnIndex + 0.5) * cellWidth;
          const cy = paddingVertical + (node.rowIndex + 0.5) * cellHeight;
          coreCtx.beginPath();
          coreCtx.arc(cx, cy, params.coreLineWidth / 2.0, 0, Math.PI * 2);
          coreCtx.fill();
        }
        continue;
      }
      traceChainPath(coreCtx, chain);
      coreCtx.stroke();
      drawCaps(coreCtx, chain, params.coreLineWidth);
    }
  }

  // Draw Dots
  if (dotCtx && params.dotSize > 0) {
    const shouldHide =
      params.autoHideDotsWhenRounded && params.cornerRoundnessPercent > 0;
    if (!shouldHide) {
      dotCtx.fillStyle = "#FFFFFF";
      for (const chain of pathGroupList) {
        for (const node of chain) {
          const cx =
            paddingHorizontal + (node.columnIndex + 0.5) * cellWidth;
          const cy = paddingVertical + (node.rowIndex + 0.5) * cellHeight;
          dotCtx.beginPath();
          dotCtx.arc(cx, cy, params.dotSize / 2.0, 0, Math.PI * 2);
          dotCtx.fill();
        }
      }
    }
  }

  const getBinaryMask = (
    ctx: CanvasRenderingContext2D | null,
  ): Uint8Array => {
    const mask = new Uint8Array(numPixels);
    if (!ctx) return mask;
    const data = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
    for (let i = 0; i < numPixels; i++) {
      mask[i] = data[i * 4 + 3] > 32 ? 1 : 0;
    }
    return mask;
  };

  return {
    outerMask: getBinaryMask(outerCtx),
    coreMask: getBinaryMask(coreCtx),
    gridMask: getBinaryMask(gridCtx),
    dotMask: getBinaryMask(dotCtx),
    outerHalfWidth,
    coreHalfWidth,
    gridHalfWidth,
  };
}

/**
 * Main 3D Relief & Internal Shadow Overlay Renderer.
 * Renders physically accurate tube-bevel shading strictly internal to each stroke.
 */
export function renderRelief3dOverlay(
  _p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  params: SketchParameters,
  pathGroupList: PathChain[],
): void {
  if (!params.show3dShadow) return;

  const currentLogKey = `${params.shadowDepth3d}_${params.lightAngle3d}_${params.shadowIntensity3d}_${params.highlightIntensity3d}_${params.bevelSmoothness3d}_${canvasWidth}x${canvasHeight}`;
  if (currentLogKey !== lastReliefLogKey) {
    lastReliefLogKey = currentLogKey;
    console.log(
      `[Relief3dOverlay] Physics SDF Shading updated: depth=${params.shadowDepth3d}, lightAngle=${params.lightAngle3d}, shadow=${params.shadowIntensity3d}, highlight=${params.highlightIntensity3d}`,
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

  const srcCtx = srcCanvas.getContext("2d");
  if (!srcCtx) {
    targetBuffer.pop();
    return;
  }

  const numPixels = canvasWidth * canvasHeight;

  // 1. Generate precise geometry masks for each layer
  const {
    outerMask,
    coreMask,
    gridMask,
    dotMask,
    outerHalfWidth,
    coreHalfWidth,
    gridHalfWidth,
  } = renderElementMasks(canvasWidth, canvasHeight, params, pathGroupList);

  // 2. Compute Euclidean distance from stroke edges for each layer
  const outerDist = computeDistanceToEdge(
    outerMask,
    canvasWidth,
    canvasHeight,
    outerHalfWidth * 1.5,
  );
  const coreDist = computeDistanceToEdge(
    coreMask,
    canvasWidth,
    canvasHeight,
    coreHalfWidth * 1.5,
  );
  const gridDist = computeDistanceToEdge(
    gridMask,
    canvasWidth,
    canvasHeight,
    gridHalfWidth * 1.5,
  );
  const dotDist = computeDistanceToEdge(
    dotMask,
    canvasWidth,
    canvasHeight,
    Math.max(1, params.dotSize / 2.0),
  );

  // 3. Build unified cross-section heightmap H(x, y)
  // Strict hierarchy: Outer Envelope (1.0) > Core (0.6) > Grid Lines (0.25) > Background (0.0)
  const heightmap = new Float32Array(numPixels);
  const smoothness = Math.max(0.1, params.bevelSmoothness3d ?? 0.5);

  for (let i = 0; i < numPixels; i++) {
    let h = 0.0;

    // Grid Layer (Base)
    if (gridMask[i] > 0) {
      const normD = Math.min(
        1.0,
        gridDist[i] / (gridHalfWidth * smoothness),
      );
      const profile = Math.sin(normD * Math.PI * 0.5);
      h = Math.max(h, ELEVATION_GRID * profile);
    }

    // Core Layer (Middle)
    if (coreMask[i] > 0) {
      const normD = Math.min(
        1.0,
        coreDist[i] / (coreHalfWidth * smoothness),
      );
      // Cylindrical dome profile: sqrt(1 - (1-d)^2)
      const profile = Math.sqrt(Math.max(0, normD * (2.0 - normD)));
      h = Math.max(h, ELEVATION_CORE * profile);
    }

    // Dot Layer
    if (dotMask[i] > 0) {
      const normD = Math.min(
        1.0,
        dotDist[i] / Math.max(1, (params.dotSize / 2.0) * smoothness),
      );
      const profile = Math.sqrt(Math.max(0, normD * (2.0 - normD)));
      h = Math.max(h, ELEVATION_DOT * profile);
    }

    // Outer Envelope Layer (Top)
    if (outerMask[i] > 0) {
      const normD = Math.min(
        1.0,
        outerDist[i] / (outerHalfWidth * smoothness),
      );
      // Smooth torus/tube-ridge profile
      const profile = Math.sqrt(Math.max(0, normD * (2.0 - normD)));
      h = Math.max(h, ELEVATION_OUTER * profile);
    }

    heightmap[i] = h;
  }

  // 4. Prepare Lighting Vector L
  const lightAngleRad = ((params.lightAngle3d ?? 315) * Math.PI) / 180.0;
  const lx = Math.cos(lightAngleRad);
  const ly = Math.sin(lightAngleRad);
  const lz = 0.85; // Light elevation slope
  const lLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
  const normLx = lx / lLen;
  const normLy = ly / lLen;
  const normLz = lz / lLen;

  // Blinn-Phong Halfway Vector H
  const hx = normLx;
  const hy = normLy;
  const hz = normLz + 1.0;
  const hLen = Math.sqrt(hx * hx + hy * hy + hz * hz);
  const normHx = hx / hLen;
  const normHy = hy / hLen;
  const normHz = hz / hLen;

  const artworkImgData = srcCtx.getImageData(
    0,
    0,
    canvasWidth,
    canvasHeight,
  );
  const artPixels = artworkImgData.data;

  const depthScale = (params.shadowDepth3d ?? 0.6) * 12.0;
  const shadowIntensity = (params.shadowIntensity3d ?? 0.65) * 1.35;
  const highlightIntensity = (params.highlightIntensity3d ?? 0.5) * 1.5;

  const W = canvasWidth;
  const H = canvasHeight;

  // 5. Normal Mapping & Internal Shading
  for (let y = 0; y < H; y++) {
    const yOff = y * W;
    const prevYOff = y > 0 ? (y - 1) * W : yOff;
    const nextYOff = y < H - 1 ? (y + 1) * W : yOff;

    for (let x = 0; x < W; x++) {
      const idx = (yOff + x) * 4;
      const hCenter = heightmap[yOff + x];

      // If purely background (height == 0), skip to guarantee NO external shadows
      if (hCenter <= 0.001) {
        continue;
      }

      const prevX = x > 0 ? x - 1 : x;
      const nextX = x < W - 1 ? x + 1 : x;

      const hL = heightmap[yOff + prevX];
      const hR = heightmap[yOff + nextX];
      const hU = heightmap[prevYOff + x];
      const hD = heightmap[nextYOff + x];

      const dx = (hR - hL) * depthScale;
      const dy = (hD - hU) * depthScale;

      const nx = -dx;
      const ny = -dy;
      const nz = 1.0;
      const nLen = Math.sqrt(nx * nx + ny * ny + 1.0);
      const normNx = nx / nLen;
      const normNy = ny / nLen;
      const normNz = nz / nLen;

      // Diffuse N • L
      const nDotL = normNx * normLx + normNy * normLy + normNz * normLz;

      // Specular (N • H)^shininess
      const nDotH = Math.max(
        0,
        normNx * normHx + normNy * normHy + normNz * normHz,
      );
      const specular = nDotH ** 22;

      let r = artPixels[idx];
      let g = artPixels[idx + 1];
      let b = artPixels[idx + 2];

      // Internal Shadow (Where slope turns away from light inside the stroke)
      if (nDotL < 0.65) {
        const shadowAmt = Math.min(
          1.0,
          (0.65 - nDotL) * shadowIntensity * hCenter,
        );
        const shadowMul = 1.0 - shadowAmt * 0.75;
        r = Math.round(r * shadowMul);
        g = Math.round(g * shadowMul);
        b = Math.round(b * shadowMul);
      }

      // Internal Highlight & Specular on ridges
      if (nDotL > 0.7 || specular > 0.05) {
        const diffLight = Math.max(0, nDotL - 0.7) * 0.7;
        const specLight = specular * 1.4;
        const lightAmt = Math.min(
          1.0,
          (diffLight + specLight) * highlightIntensity * hCenter,
        );

        r = Math.min(255, Math.round(r + (255 - r) * lightAmt * 0.8));
        g = Math.min(255, Math.round(g + (255 - g) * lightAmt * 0.8));
        b = Math.min(255, Math.round(b + (255 - b) * lightAmt * 0.8));
      }

      artPixels[idx] = r;
      artPixels[idx + 1] = g;
      artPixels[idx + 2] = b;
    }
  }

  srcCtx.putImageData(artworkImgData, 0, 0);

  targetBuffer.pop();
}
