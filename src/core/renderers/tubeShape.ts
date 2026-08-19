import type p5 from "p5";
import type { PathChain, SketchParameters } from "../../types/sketch";
import { drawGridLines } from "./gridLines";
import { getLayoutMetrics } from "./layoutHelper";
import { drawIsolatedCellNode, drawPathEndCaps } from "./tubeCaps";

/**
 * Draws a single path chain as a polyline with optional corner rounding
 * using quadratic Bezier curves at each interior node.
 */
function drawChainLinePath(
  targetGraphics: p5 | p5.Graphics,
  chainNodes: PathChain,
  paddingX: number,
  paddingY: number,
  cellW: number,
  cellH: number,
  roundnessPercent: number,
): void {
  if (chainNodes.length === 0) return;

  const roundnessFactor = roundnessPercent / 100.0;
  const maxCornerRadius = Math.min(cellW, cellH) * 0.45 * roundnessFactor;

  if (chainNodes.length === 1 || maxCornerRadius <= 0.001) {
    targetGraphics.beginShape();
    for (let nodeIndex = 0; nodeIndex < chainNodes.length; nodeIndex++) {
      const node = chainNodes[nodeIndex];
      const centerPixelX = paddingX + (node.columnIndex + 0.5) * cellW;
      const centerPixelY = paddingY + (node.rowIndex + 0.5) * cellH;
      targetGraphics.vertex(centerPixelX, centerPixelY);
    }
    targetGraphics.endShape();
    return;
  }

  targetGraphics.beginShape();

  const firstNode = chainNodes[0];
  const startX = paddingX + (firstNode.columnIndex + 0.5) * cellW;
  const startY = paddingY + (firstNode.rowIndex + 0.5) * cellH;
  targetGraphics.vertex(startX, startY);

  for (let nodeIndex = 1; nodeIndex < chainNodes.length - 1; nodeIndex++) {
    const previousNode = chainNodes[nodeIndex - 1];
    const currentNode = chainNodes[nodeIndex];
    const nextNode = chainNodes[nodeIndex + 1];

    const previousX = paddingX + (previousNode.columnIndex + 0.5) * cellW;
    const previousY = paddingY + (previousNode.rowIndex + 0.5) * cellH;
    const currentX = paddingX + (currentNode.columnIndex + 0.5) * cellW;
    const currentY = paddingY + (currentNode.rowIndex + 0.5) * cellH;
    const nextX = paddingX + (nextNode.columnIndex + 0.5) * cellW;
    const nextY = paddingY + (nextNode.rowIndex + 0.5) * cellH;

    const vectorInX = currentX - previousX;
    const vectorInY = currentY - previousY;
    const distanceIn = Math.sqrt(
      vectorInX * vectorInX + vectorInY * vectorInY,
    );

    const vectorOutX = nextX - currentX;
    const vectorOutY = nextY - currentY;
    const distanceOut = Math.sqrt(
      vectorOutX * vectorOutX + vectorOutY * vectorOutY,
    );

    const cornerRadius = Math.min(
      maxCornerRadius,
      distanceIn * 0.45,
      distanceOut * 0.45,
    );

    if (cornerRadius <= 0.001) {
      targetGraphics.vertex(currentX, currentY);
    } else {
      const cutInX = currentX - (vectorInX / distanceIn) * cornerRadius;
      const cutInY = currentY - (vectorInY / distanceIn) * cornerRadius;
      const cutOutX = currentX + (vectorOutX / distanceOut) * cornerRadius;
      const cutOutY = currentY + (vectorOutY / distanceOut) * cornerRadius;

      targetGraphics.vertex(cutInX, cutInY);
      targetGraphics.quadraticVertex(currentX, currentY, cutOutX, cutOutY);
    }
  }

  const lastNode = chainNodes[chainNodes.length - 1];
  const endX = paddingX + (lastNode.columnIndex + 0.5) * cellW;
  const endY = paddingY + (lastNode.rowIndex + 0.5) * cellH;
  targetGraphics.vertex(endX, endY);

  targetGraphics.endShape();
}

/**
 * Renders all path chains as layered tube graphics (outline → cavity → core → dots).
 */
export function renderPathsGraphics(
  targetGraphics: p5 | p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  params: SketchParameters,
  pathGroupList: PathChain[],
): void {
  const { paddingHorizontal, paddingVertical, cellWidth, cellHeight } =
    getLayoutMetrics(canvasWidth, canvasHeight, params);

  targetGraphics.push();

  // Layer 0: Optional Grid Lines Rendering
  drawGridLines(targetGraphics, canvasWidth, canvasHeight, params);

  const outerTubeStrokeWeight =
    Math.min(cellWidth, cellHeight) * params.tubeWidthRatio;
  const innerTubeStrokeWeight =
    outerTubeStrokeWeight * params.tubeInnerRatio;

  const roundJoin =
    (targetGraphics as unknown as { ROUND?: p5.STROKE_JOIN }).ROUND ||
    ("round" as p5.STROKE_JOIN);
  const buttCap =
    (targetGraphics as unknown as { SQUARE?: p5.STROKE_CAP }).SQUARE ||
    ("butt" as p5.STROKE_CAP);

  targetGraphics.strokeJoin(roundJoin);
  targetGraphics.strokeCap(buttCap);

  // Layer 1: Outer Envelope / Tube Boundary
  targetGraphics.noFill();
  targetGraphics.stroke(params.outlineColor);
  targetGraphics.strokeWeight(outerTubeStrokeWeight);

  for (
    let pathGroupIndex = 0;
    pathGroupIndex < pathGroupList.length;
    pathGroupIndex++
  ) {
    const currentChain = pathGroupList[pathGroupIndex];
    if (currentChain.length < 2) {
      if (currentChain.length === 1) {
        const node = currentChain[0];
        const cx =
          paddingHorizontal + (node.columnIndex + 0.5) * cellWidth;
        const cy = paddingVertical + (node.rowIndex + 0.5) * cellHeight;
        drawIsolatedCellNode(
          targetGraphics,
          cx,
          cy,
          outerTubeStrokeWeight,
          params.outlineColor,
          params.tipRoundnessPercent,
        );
      }
      continue;
    }

    drawChainLinePath(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      params.cornerRoundnessPercent,
    );
    drawPathEndCaps(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      outerTubeStrokeWeight,
      params.outlineColor,
      params.tipRoundnessPercent,
    );
  }

  // Layer 2: Inner Cavity Cutout
  targetGraphics.stroke(params.backgroundColor);
  targetGraphics.strokeWeight(innerTubeStrokeWeight);

  for (
    let pathGroupIndex = 0;
    pathGroupIndex < pathGroupList.length;
    pathGroupIndex++
  ) {
    const currentChain = pathGroupList[pathGroupIndex];
    if (currentChain.length < 2) {
      if (currentChain.length === 1) {
        const node = currentChain[0];
        const cx =
          paddingHorizontal + (node.columnIndex + 0.5) * cellWidth;
        const cy = paddingVertical + (node.rowIndex + 0.5) * cellHeight;
        drawIsolatedCellNode(
          targetGraphics,
          cx,
          cy,
          innerTubeStrokeWeight,
          params.backgroundColor,
          params.tipRoundnessPercent,
        );
      }
      continue;
    }

    drawChainLinePath(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      params.cornerRoundnessPercent,
    );
    drawPathEndCaps(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      innerTubeStrokeWeight,
      params.backgroundColor,
      params.tipRoundnessPercent,
    );
  }

  // Layer 3: Core Central Axis Line
  targetGraphics.stroke(params.coreColor);
  targetGraphics.strokeWeight(params.coreLineWidth);

  for (
    let pathGroupIndex = 0;
    pathGroupIndex < pathGroupList.length;
    pathGroupIndex++
  ) {
    const currentChain = pathGroupList[pathGroupIndex];
    if (currentChain.length < 2) {
      if (currentChain.length === 1) {
        const node = currentChain[0];
        const cx =
          paddingHorizontal + (node.columnIndex + 0.5) * cellWidth;
        const cy = paddingVertical + (node.rowIndex + 0.5) * cellHeight;
        drawIsolatedCellNode(
          targetGraphics,
          cx,
          cy,
          params.coreLineWidth,
          params.coreColor,
          params.tipRoundnessPercent,
        );
      }
      continue;
    }

    drawChainLinePath(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      params.cornerRoundnessPercent,
    );
    drawPathEndCaps(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      params.coreLineWidth,
      params.coreColor,
      params.tipRoundnessPercent,
    );
  }

  // Layer 4: Cell Center White Dots
  targetGraphics.noStroke();
  targetGraphics.fill(params.dotColor);

  const shouldHideDots =
    params.autoHideDotsWhenRounded && params.cornerRoundnessPercent > 0;

  if (params.dotSize > 0 && !shouldHideDots) {
    for (
      let pathGroupIndex = 0;
      pathGroupIndex < pathGroupList.length;
      pathGroupIndex++
    ) {
      const currentChain = pathGroupList[pathGroupIndex];
      for (
        let nodeIndex = 0;
        nodeIndex < currentChain.length;
        nodeIndex++
      ) {
        const node = currentChain[nodeIndex];
        const centerPixelX =
          paddingHorizontal + (node.columnIndex + 0.5) * cellWidth;
        const centerPixelY =
          paddingVertical + (node.rowIndex + 0.5) * cellHeight;
        targetGraphics.circle(centerPixelX, centerPixelY, params.dotSize);
      }
    }
  }

  targetGraphics.pop();
}
