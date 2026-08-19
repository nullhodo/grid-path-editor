import type p5 from "p5";
import type { PathChain, SketchParameters } from "../types/sketch";
import { getFormattedDate } from "../utils/date";
import { renderPathsGraphics } from "./renderer";
import { renderCmykPrintOverlay } from "./renderers/cmykRenderer";
import { renderDitheringOverlay } from "./renderers/ditheringRenderer";
import { renderGrainOverlay } from "./renderers/grainOverlay";
import { renderHalftoneScreenOverlay } from "./renderers/halftoneRenderer";
import { renderInkBleedOverlay } from "./renderers/inkBleedRenderer";
import { renderPaperTextureOverlay } from "./renderers/paperTextureRenderer";
import { renderRelief3dOverlay } from "./renderers/relief3dRenderer";
import { renderRisoPrintOverlay } from "./renderers/risoRenderer";

/**
 * Safely removes offscreen p5.Graphics without throwing DOM indexOf TypeError
 */
function safeRemoveGraphics(graphics: p5.Graphics): void {
  try {
    graphics.remove();
  } catch {
    const elt =
      (graphics as unknown as { elt?: HTMLElement; canvas?: HTMLElement })
        .elt || (graphics as unknown as { canvas?: HTMLElement }).canvas;
    if (elt?.parentNode) {
      elt.parentNode.removeChild(elt);
    }
  }
}

interface SketchConfigFile {
  version: string;
  exportedAt: string;
  params: SketchParameters;
  pathChains?: PathChain[];
}

/**
 * Exports high-resolution image scaled properly without layout breaking, along with JSON
 */
export function exportHighResImage(
  p5Instance: p5,
  params: SketchParameters,
  pathGroupList: PathChain[],
  exportWidth = 2880,
  exportHeight = 2880,
): void {
  const timestampString = getFormattedDate();
  const filenameBase = `grid-path-editor_${timestampString}_${exportWidth}x${exportHeight}`;

  console.log(
    `[Export] Creating High-Res Offscreen Canvas: ${exportWidth}x${exportHeight}`,
  );

  const offscreenGraphics = p5Instance.createGraphics(
    exportWidth,
    exportHeight,
  );
  offscreenGraphics.background(params.backgroundColor);

  const currentCanvasWidth = p5Instance.width || 800;
  const scaleFactor = exportWidth / currentCanvasWidth;
  const scaledParams = JSON.parse(
    JSON.stringify(params),
  ) as SketchParameters;

  scaledParams.coreLineWidth = params.coreLineWidth * scaleFactor;
  scaledParams.dotSize = params.dotSize * scaleFactor;
  scaledParams.gridLineWidth = params.gridLineWidth * scaleFactor;
  scaledParams.debugMode = false;

  renderPathsGraphics(
    offscreenGraphics,
    exportWidth,
    exportHeight,
    scaledParams,
    pathGroupList,
  );

  if (params.show3dShadow) {
    renderRelief3dOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      scaledParams,
      pathGroupList,
    );
  }

  // Apply artistic texture effects to high-res export
  if (params.showGrain) {
    renderGrainOverlay(
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.grainIntensity || 0.15,
    );
  }

  if (params.showCmyk) {
    renderCmykPrintOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.cmykOffsetFactor !== undefined
        ? params.cmykOffsetFactor
        : 0.35,
      params.cmykIntensity !== undefined ? params.cmykIntensity : 0.9,
      params.backgroundColor,
    );
  }

  if (params.showRiso) {
    renderRisoPrintOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      (params.risoOffsetPx || 3) * scaleFactor,
      params.risoIntensity || 0.25,
    );
  }

  if (params.showHalftone) {
    renderHalftoneScreenOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      (params.halftoneSize || 6) * scaleFactor,
      params.halftoneAngle || 45,
    );
  }

  if (params.showDithering) {
    renderDitheringOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.ditheringScale || 2,
      params.ditheringLevels || 4,
    );
  }

  if (params.showInkBleed) {
    renderInkBleedOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      (params.inkBleedAmount || 4) * scaleFactor,
      params.inkBleedRoughness || 0.4,
    );
  }

  if (params.showPaperTexture) {
    renderPaperTextureOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.paperRoughness || 0.35,
      params.paperColorDensity || 0.2,
    );
  }

  p5Instance.save(offscreenGraphics, `${filenameBase}.jpg`);
  safeRemoveGraphics(offscreenGraphics);

  exportJsonSettings(scaledParams, pathGroupList, `${filenameBase}.json`);
}

/**
 * Exports vector graphics as SVG file using p5.js SVG renderer capabilities
 */
export function exportSvgGraphics(
  p5Instance: p5,
  params: SketchParameters,
  pathGroupList: PathChain[],
  canvasWidth = 1200,
  canvasHeight = 1200,
): void {
  const timestampString = getFormattedDate();
  const filenameBase = `grid-path-editor_${timestampString}_vector`;

  console.log(
    `[Export SVG] Rendering SVG graphics: ${canvasWidth}x${canvasHeight}`,
  );

  const svgRendererMode =
    (p5Instance as unknown as { SVG?: p5.RENDERER }).SVG ||
    ("svg" as p5.RENDERER);
  const svgGraphics = p5Instance.createGraphics(
    canvasWidth,
    canvasHeight,
    svgRendererMode,
  );

  svgGraphics.background(params.backgroundColor);
  const scaledParams = JSON.parse(
    JSON.stringify(params),
  ) as SketchParameters;
  scaledParams.debugMode = false;

  renderPathsGraphics(
    svgGraphics,
    canvasWidth,
    canvasHeight,
    scaledParams,
    pathGroupList,
  );

  p5Instance.save(svgGraphics, `${filenameBase}.svg`);
  safeRemoveGraphics(svgGraphics);
}

/**
 * Formats parameters and pathChains into standard JSON and downloads it
 */
export function exportJsonSettings(
  params: SketchParameters,
  pathChains?: PathChain[],
  filename?: string,
): void {
  const timestampString = getFormattedDate();
  const targetFilename =
    filename || `grid-path-editor_${timestampString}.json`;

  const exportData: SketchConfigFile = {
    version: "2.0",
    exportedAt: new Date().toISOString(),
    params,
    pathChains,
  };

  const jsonContentString = JSON.stringify(exportData, null, 2);

  const blob = new Blob([jsonContentString], { type: "application/json" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = targetFilename;
  downloadLink.click();
  URL.revokeObjectURL(downloadLink.href);

  console.log(`[Export] Saved parameters to JSON: ${targetFilename}`);
}

/**
 * Parses uploaded JSON file to restore sketch parameters and path chains
 */
export function parseJsonSettings(rawText: string): {
  params: SketchParameters;
  pathChains?: PathChain[];
} {
  const parsed = JSON.parse(rawText);
  if (parsed && typeof parsed === "object" && "params" in parsed) {
    return {
      params: parsed.params as SketchParameters,
      pathChains: parsed.pathChains as PathChain[] | undefined,
    };
  }
  // Backward compatibility with raw SketchParameters JSON
  return {
    params: parsed as SketchParameters,
  };
}
