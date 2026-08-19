import type p5 from "p5";
import type { SketchParameters } from "../../types/sketch";
import { getLayoutMetrics } from "./layoutHelper";

/**
 * Draws all grid line overlays according to params.
 * Covers inner border lines, tube-centerline offset lines, and outer border.
 */
export function drawGridLines(
  targetGraphics: p5 | p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  params: SketchParameters,
): void {
  if (!params.showGridLines) return;

  const {
    paddingHorizontal,
    paddingVertical,
    usableWidth,
    usableHeight,
    cellWidth,
    cellHeight,
  } = getLayoutMetrics(canvasWidth, canvasHeight, params);

  targetGraphics.stroke(params.gridLineColor);
  targetGraphics.strokeWeight(params.gridLineWidth);
  targetGraphics.noFill();

  if (params.showGridInnerHorizontal) {
    for (let rowIndex = 1; rowIndex < params.gridRows; rowIndex++) {
      const coordinateY = paddingVertical + rowIndex * cellHeight;
      targetGraphics.line(
        paddingHorizontal,
        coordinateY,
        paddingHorizontal + usableWidth,
        coordinateY,
      );
    }
  }

  if (params.showGridInnerVertical) {
    for (
      let columnIndex = 1;
      columnIndex < params.gridColumns;
      columnIndex++
    ) {
      const coordinateX = paddingHorizontal + columnIndex * cellWidth;
      targetGraphics.line(
        coordinateX,
        paddingVertical,
        coordinateX,
        paddingVertical + usableHeight,
      );
    }
  }

  if (params.showGridCenterHorizontal) {
    for (let rowIndex = 0; rowIndex < params.gridRows; rowIndex++) {
      const coordinateY = paddingVertical + (rowIndex + 0.5) * cellHeight;
      targetGraphics.line(
        paddingHorizontal,
        coordinateY,
        paddingHorizontal + usableWidth,
        coordinateY,
      );
    }
  }

  if (params.showGridCenterVertical) {
    for (
      let columnIndex = 0;
      columnIndex < params.gridColumns;
      columnIndex++
    ) {
      const coordinateX =
        paddingHorizontal + (columnIndex + 0.5) * cellWidth;
      targetGraphics.line(
        coordinateX,
        paddingVertical,
        coordinateX,
        paddingVertical + usableHeight,
      );
    }
  }

  if (params.showGridOuterBorder) {
    targetGraphics.rect(
      paddingHorizontal,
      paddingVertical,
      usableWidth,
      usableHeight,
    );
  }
}
