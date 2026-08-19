import type p5 from "p5";
import type { PathChain, SketchParameters } from "../../types/sketch";
import { getLayoutMetrics } from "./layoutHelper";

const KAPPA = 0.5522847498;

/**
 * Draws crisp text with a dark outline for maximum readability on any background.
 */
function drawOutlinedText(
  targetGraphics: p5 | p5.Graphics,
  str: string,
  x: number,
  y: number,
  textSize = 10,
  alignH: p5.HORIZ_ALIGN = "left" as p5.HORIZ_ALIGN,
  alignV: p5.VERT_ALIGN = "bottom" as p5.VERT_ALIGN,
  textColor = "#FFFFFF",
  strokeColor = "#000000",
  strokeW = 3,
): void {
  targetGraphics.push();
  targetGraphics.textSize(textSize);
  if ("textAlign" in targetGraphics) {
    (
      targetGraphics as unknown as {
        textAlign: (h: p5.HORIZ_ALIGN, v?: p5.VERT_ALIGN) => void;
      }
    ).textAlign(alignH, alignV);
  }
  targetGraphics.stroke(strokeColor);
  targetGraphics.strokeWeight(strokeW);
  targetGraphics.fill(textColor);
  targetGraphics.text(str, x, y);
  targetGraphics.pop();
}

/**
 * Draws an outlined line (dark background line + bright inner line).
 */
function drawOutlinedLine(
  targetGraphics: p5 | p5.Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineColor = "#FFFFFF",
  outlineColor = "#000000",
  weight = 1.5,
): void {
  targetGraphics.push();
  targetGraphics.stroke(outlineColor);
  targetGraphics.strokeWeight(weight + 2.5);
  targetGraphics.line(x1, y1, x2, y2);

  targetGraphics.stroke(lineColor);
  targetGraphics.strokeWeight(weight);
  targetGraphics.line(x1, y1, x2, y2);
  targetGraphics.pop();
}

/**
 * Draws an outlined circle (dark border + bright fill).
 */
function drawOutlinedCircle(
  targetGraphics: p5 | p5.Graphics,
  x: number,
  y: number,
  diameter: number,
  fillColor = "#FF00FF",
  strokeColor = "#000000",
  strokeW = 2,
): void {
  targetGraphics.push();
  targetGraphics.stroke(strokeColor);
  targetGraphics.strokeWeight(strokeW);
  targetGraphics.fill(fillColor);
  targetGraphics.circle(x, y, diameter);
  targetGraphics.pop();
}

/**
 * Renders debug overlay information on top of the canvas.
 * Shows: grid cell coordinates, corner arc sectors with [r1, r2] radius labels,
 * and tip cap sector fan shapes with rtip labels, all styled with dark outlines for high visibility.
 */
export function renderDebugInformation(
  targetGraphics: p5 | p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  params: SketchParameters,
  pathGroupList: PathChain[],
): void {
  const { paddingHorizontal, paddingVertical, cellWidth, cellHeight } =
    getLayoutMetrics(canvasWidth, canvasHeight, params);

  const minCellDimension = Math.min(cellWidth, cellHeight);
  const outerTubeStrokeWeight = minCellDimension * params.tubeWidthRatio;
  const halfTubeWidth = outerTubeStrokeWeight / 2.0;

  const maxCornerRadius =
    (params.cornerRoundnessPercent / 100.0) * minCellDimension * 0.45;

  targetGraphics.push();

  // 0. Cell Coordinates Grid Overlay
  targetGraphics.stroke(255, 255, 255, 30);
  targetGraphics.strokeWeight(1);
  targetGraphics.noFill();

  const leftAlign = (
    "LEFT" in targetGraphics ? targetGraphics.LEFT : "left"
  ) as p5.HORIZ_ALIGN;
  const topAlign = (
    "TOP" in targetGraphics ? targetGraphics.TOP : "top"
  ) as p5.VERT_ALIGN;
  const centerAlignH = (
    "CENTER" in targetGraphics ? targetGraphics.CENTER : "center"
  ) as p5.HORIZ_ALIGN;
  const centerAlignV = ("CENTER" in targetGraphics
    ? targetGraphics.CENTER
    : "center") as unknown as p5.VERT_ALIGN;

  for (let rowIndex = 0; rowIndex < params.gridRows; rowIndex++) {
    for (
      let columnIndex = 0;
      columnIndex < params.gridColumns;
      columnIndex++
    ) {
      const leftPixelX = paddingHorizontal + columnIndex * cellWidth;
      const topPixelY = paddingVertical + rowIndex * cellHeight;
      targetGraphics.rect(leftPixelX, topPixelY, cellWidth, cellHeight);

      drawOutlinedText(
        targetGraphics,
        `${columnIndex},${rowIndex}`,
        leftPixelX + 4,
        topPixelY + 4,
        10,
        leftAlign,
        topAlign,
        "#FFFFFF",
        "#000000",
        2.5,
      );
    }
  }

  // 1. Corner Arc Sectors, Extended Radius Lines & [r1, r2] Labels
  if (maxCornerRadius > 0.0001) {
    for (
      let pathGroupIndex = 0;
      pathGroupIndex < pathGroupList.length;
      pathGroupIndex++
    ) {
      const currentChain = pathGroupList[pathGroupIndex];
      for (
        let nodeIndex = 1;
        nodeIndex < currentChain.length - 1;
        nodeIndex++
      ) {
        const previousNode = currentChain[nodeIndex - 1];
        const currentNode = currentChain[nodeIndex];
        const nextNode = currentChain[nodeIndex + 1];

        const previousX =
          paddingHorizontal + (previousNode.columnIndex + 0.5) * cellWidth;
        const previousY =
          paddingVertical + (previousNode.rowIndex + 0.5) * cellHeight;
        const currentX =
          paddingHorizontal + (currentNode.columnIndex + 0.5) * cellWidth;
        const currentY =
          paddingVertical + (currentNode.rowIndex + 0.5) * cellHeight;
        const nextX =
          paddingHorizontal + (nextNode.columnIndex + 0.5) * cellWidth;
        const nextY =
          paddingVertical + (nextNode.rowIndex + 0.5) * cellHeight;

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

        const unitInX = vectorInX / distanceIn;
        const unitInY = vectorInY / distanceIn;
        const unitOutX = vectorOutX / distanceOut;
        const unitOutY = vectorOutY / distanceOut;

        // Check if node is an actual corner bend (non-straight)
        const unitCrossProduct = Math.abs(
          unitInX * unitOutY - unitInY * unitOutX,
        );
        const isCornerBend = unitCrossProduct > 0.01;

        if (!isCornerBend || cornerRadius <= 0.0001) continue;

        const tangentInX = currentX - unitInX * cornerRadius;
        const tangentInY = currentY - unitInY * cornerRadius;
        const tangentOutX = currentX + unitOutX * cornerRadius;
        const tangentOutY = currentY + unitOutY * cornerRadius;

        const handleInLength = cornerRadius * (1.0 - KAPPA);
        const controlInX = currentX - unitInX * handleInLength;
        const controlInY = currentY - unitInY * handleInLength;
        const controlOutX = currentX + unitOutX * handleInLength;
        const controlOutY = currentY + unitOutY * handleInLength;

        const arcCenterX =
          currentX - unitInX * cornerRadius + unitOutX * cornerRadius;
        const arcCenterY =
          currentY - unitInY * cornerRadius + unitOutY * cornerRadius;

        const r1 = cornerRadius;
        const r2 = cornerRadius + halfTubeWidth;

        const extendedInX = arcCenterX - unitOutX * r2;
        const extendedInY = arcCenterY - unitOutY * r2;
        const extendedOutX = arcCenterX + unitInX * r2;
        const extendedOutY = arcCenterY + unitInY * r2;

        // 1a. Semi-transparent White Sector Wedge (扇形)
        targetGraphics.noStroke();
        targetGraphics.fill(255, 255, 255, 70);
        targetGraphics.beginShape();
        targetGraphics.vertex(arcCenterX, arcCenterY);
        targetGraphics.vertex(tangentInX, tangentInY);
        targetGraphics.bezierVertex(
          controlInX,
          controlInY,
          controlOutX,
          controlOutY,
          tangentOutX,
          tangentOutY,
        );
        targetGraphics.endShape(
          "CLOSE" in targetGraphics
            ? (targetGraphics.CLOSE as p5.CLOSE)
            : undefined,
        );

        // 1b. Outlined White Radius Lines extended out to Outer Boundary
        drawOutlinedLine(
          targetGraphics,
          arcCenterX,
          arcCenterY,
          extendedInX,
          extendedInY,
          "#FFFFFF",
          "#000000",
          1.8,
        );
        drawOutlinedLine(
          targetGraphics,
          arcCenterX,
          arcCenterY,
          extendedOutX,
          extendedOutY,
          "#FFFFFF",
          "#000000",
          1.8,
        );

        // 1c. Outlined White Center Dot (扇形の中心点)
        drawOutlinedCircle(
          targetGraphics,
          arcCenterX,
          arcCenterY,
          7,
          "#FFFFFF",
          "#000000",
          2,
        );

        // 1d. Outlined White Radius Text Label: [r1, r2]
        drawOutlinedText(
          targetGraphics,
          `[r1=${Math.round(r1)}, r2=${Math.round(r2)}]`,
          arcCenterX + 6,
          arcCenterY - 4,
          10,
          leftAlign,
          topAlign,
          "#FFFFFF",
          "#000000",
          3,
        );
      }
    }
  }

  // 2. Tip Roundness Sector Fan Shapes, Center Visualization & rtip Label
  for (
    let pathGroupIndex = 0;
    pathGroupIndex < pathGroupList.length;
    pathGroupIndex++
  ) {
    const currentChain = pathGroupList[pathGroupIndex];
    if (currentChain.length < 2) continue;

    const renderCapDebug = (
      currentNode: PathChain[0],
      adjacentNode: PathChain[0],
    ) => {
      const currentX =
        paddingHorizontal + (currentNode.columnIndex + 0.5) * cellWidth;
      const currentY =
        paddingVertical + (currentNode.rowIndex + 0.5) * cellHeight;
      const adjacentX =
        paddingHorizontal + (adjacentNode.columnIndex + 0.5) * cellWidth;
      const adjacentY =
        paddingVertical + (adjacentNode.rowIndex + 0.5) * cellHeight;

      const vectorX = currentX - adjacentX;
      const vectorY = currentY - adjacentY;
      const angle = Math.atan2(vectorY, vectorX);

      const R = halfTubeWidth;
      const p = params.tipRoundnessPercent / 100.0;
      const rTip = R * p;
      const flatH = R * (1.0 - p);

      targetGraphics.push();
      targetGraphics.translate(currentX, currentY);
      targetGraphics.rotate(angle);

      if (rTip > 0.001) {
        const k = rTip * KAPPA;

        // Top Tip Sector Fan Wedge (Semi-transparent White)
        const topCenterX = R - rTip;
        const topCenterY = -flatH;
        targetGraphics.noStroke();
        targetGraphics.fill(255, 255, 255, 70);
        targetGraphics.beginShape();
        targetGraphics.vertex(topCenterX, topCenterY);
        targetGraphics.vertex(R - rTip, -R);
        targetGraphics.bezierVertex(
          R - rTip + k,
          -R,
          R,
          -flatH - k,
          R,
          -flatH,
        );
        targetGraphics.endShape(
          "CLOSE" in targetGraphics
            ? (targetGraphics.CLOSE as p5.CLOSE)
            : undefined,
        );

        // Bottom Tip Sector Fan Wedge (Semi-transparent White)
        const bottomCenterX = R - rTip;
        const bottomCenterY = flatH;
        targetGraphics.fill(255, 255, 255, 70);
        targetGraphics.beginShape();
        targetGraphics.vertex(bottomCenterX, bottomCenterY);
        targetGraphics.vertex(R, flatH);
        targetGraphics.bezierVertex(
          R,
          flatH + k,
          R - rTip + k,
          R,
          R - rTip,
          R,
        );
        targetGraphics.endShape(
          "CLOSE" in targetGraphics
            ? (targetGraphics.CLOSE as p5.CLOSE)
            : undefined,
        );

        // Outlined White Radius lines
        drawOutlinedLine(
          targetGraphics,
          topCenterX,
          topCenterY,
          R - rTip,
          -R,
          "#FFFFFF",
          "#000000",
          1.5,
        );
        drawOutlinedLine(
          targetGraphics,
          topCenterX,
          topCenterY,
          R,
          -flatH,
          "#FFFFFF",
          "#000000",
          1.5,
        );

        drawOutlinedLine(
          targetGraphics,
          bottomCenterX,
          bottomCenterY,
          R,
          flatH,
          "#FFFFFF",
          "#000000",
          1.5,
        );
        drawOutlinedLine(
          targetGraphics,
          bottomCenterX,
          bottomCenterY,
          R - rTip,
          R,
          "#FFFFFF",
          "#000000",
          1.5,
        );

        // Outlined White Center Dots
        drawOutlinedCircle(
          targetGraphics,
          topCenterX,
          topCenterY,
          6,
          "#FFFFFF",
          "#000000",
          2,
        );
        drawOutlinedCircle(
          targetGraphics,
          bottomCenterX,
          bottomCenterY,
          6,
          "#FFFFFF",
          "#000000",
          2,
        );

        // Outlined White rtip text label
        drawOutlinedText(
          targetGraphics,
          `rtip=${Math.round(rTip)}`,
          topCenterX + 6,
          topCenterY - 4,
          10,
          leftAlign,
          topAlign,
          "#FFFFFF",
          "#000000",
          3,
        );
      }

      targetGraphics.pop();
    };

    renderCapDebug(currentChain[0], currentChain[1]);
    renderCapDebug(
      currentChain[currentChain.length - 1],
      currentChain[currentChain.length - 2],
    );
  }

  // 3. Path Node Outlined Text Labels (White text with black outline)
  for (
    let pathGroupIndex = 0;
    pathGroupIndex < pathGroupList.length;
    pathGroupIndex++
  ) {
    const currentChain = pathGroupList[pathGroupIndex];
    for (let nodeIndex = 0; nodeIndex < currentChain.length; nodeIndex++) {
      const node = currentChain[nodeIndex];
      const centerPixelX =
        paddingHorizontal + (node.columnIndex + 0.5) * cellWidth;
      const centerPixelY =
        paddingVertical + (node.rowIndex + 0.5) * cellHeight;

      drawOutlinedText(
        targetGraphics,
        `P${pathGroupIndex}:${nodeIndex}`,
        centerPixelX,
        centerPixelY - 12,
        11,
        centerAlignH,
        centerAlignV,
        "#FFFFFF",
        "#000000",
        3,
      );
    }
  }

  targetGraphics.pop();
}
