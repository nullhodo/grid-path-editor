import type { SketchParameters } from "../../types/sketch";

interface LayoutMetrics {
  paddingHorizontal: number;
  paddingVertical: number;
  usableWidth: number;
  usableHeight: number;
  cellWidth: number;
  cellHeight: number;
}

/**
 * Calculates uniform layout metrics for rendering grid lines, tube shapes, and debug overlays.
 * Accurately fits the usable grid area according to params.gridPadding and params.canvasAspectRatio.
 */
export function getLayoutMetrics(
  canvasWidth: number,
  canvasHeight: number,
  params: SketchParameters,
): LayoutMetrics {
  const basePaddingX = canvasWidth * params.gridPadding;
  const basePaddingY = canvasHeight * params.gridPadding;

  const availWidth = Math.max(10, canvasWidth - basePaddingX * 2);
  const availHeight = Math.max(10, canvasHeight - basePaddingY * 2);

  let usableWidth = availWidth;
  let usableHeight = availHeight;

  const targetRatio = params.canvasAspectRatio;
  if (targetRatio && targetRatio > 0) {
    if (availWidth / availHeight > targetRatio) {
      usableWidth = availHeight * targetRatio;
    } else {
      usableHeight = availWidth / targetRatio;
    }
  }

  const paddingHorizontal = (canvasWidth - usableWidth) / 2;
  const paddingVertical = (canvasHeight - usableHeight) / 2;

  const cellWidth = usableWidth / params.gridColumns;
  const cellHeight = usableHeight / params.gridRows;

  return {
    paddingHorizontal,
    paddingVertical,
    usableWidth,
    usableHeight,
    cellWidth,
    cellHeight,
  };
}
