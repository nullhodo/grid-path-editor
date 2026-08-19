import type p5 from "p5";
import type { PathChain } from "../../types/sketch";

const KAPPA = 0.5522847498;

/**
 * Draws rounded end caps at both ends of a path chain.
 * Uses exact cubic Bezier curves for mathematically precise semicircles.
 */
export function drawPathEndCaps(
  targetGraphics: p5 | p5.Graphics,
  chainNodes: PathChain,
  paddingX: number,
  paddingY: number,
  cellW: number,
  cellH: number,
  currentStrokeWeight: number,
  currentColor: string,
  tipRoundnessPercent: number,
): void {
  if (chainNodes.length < 2) return;

  const R = currentStrokeWeight / 2.0;
  const p = tipRoundnessPercent / 100.0;
  const rTip = R * p;
  const flatH = R * (1.0 - p);
  const overlap = 1.0;

  targetGraphics.push();
  targetGraphics.fill(currentColor);
  targetGraphics.noStroke();

  const renderCapAtNode = (
    currentNode: PathChain[0],
    adjacentNode: PathChain[0],
  ) => {
    const currentX = paddingX + (currentNode.columnIndex + 0.5) * cellW;
    const currentY = paddingY + (currentNode.rowIndex + 0.5) * cellH;
    const adjacentX = paddingX + (adjacentNode.columnIndex + 0.5) * cellW;
    const adjacentY = paddingY + (adjacentNode.rowIndex + 0.5) * cellH;

    const vectorX = currentX - adjacentX;
    const vectorY = currentY - adjacentY;
    const angle = Math.atan2(vectorY, vectorX);

    targetGraphics.push();
    targetGraphics.translate(currentX, currentY);
    targetGraphics.rotate(angle);

    targetGraphics.beginShape();
    targetGraphics.vertex(-overlap, -R);
    targetGraphics.vertex(R - rTip, -R);
    if (rTip > 0.001) {
      const k = rTip * KAPPA;
      targetGraphics.bezierVertex(
        R - rTip + k,
        -R,
        R,
        -flatH - k,
        R,
        -flatH,
      );
    } else {
      targetGraphics.vertex(R, -R);
    }

    targetGraphics.vertex(R, flatH);
    if (rTip > 0.001) {
      const k = rTip * KAPPA;
      targetGraphics.bezierVertex(
        R,
        flatH + k,
        R - rTip + k,
        R,
        R - rTip,
        R,
      );
    } else {
      targetGraphics.vertex(R, R);
    }

    targetGraphics.vertex(-overlap, R);
    targetGraphics.endShape(
      "CLOSE" in targetGraphics
        ? (targetGraphics.CLOSE as p5.CLOSE)
        : undefined,
    );

    targetGraphics.pop();
  };

  renderCapAtNode(chainNodes[0], chainNodes[1]);
  renderCapAtNode(
    chainNodes[chainNodes.length - 1],
    chainNodes[chainNodes.length - 2],
  );

  targetGraphics.pop();
}

/**
 * Renders a single 1x1 isolated cell node respecting tipRoundnessPercent.
 * Renders a perfect circle at 100% tipRoundness, a sharp square at 0%,
 * and a rounded rectangle for intermediate values.
 */
export function drawIsolatedCellNode(
  targetGraphics: p5 | p5.Graphics,
  cx: number,
  cy: number,
  size: number,
  fillColor: string,
  tipRoundnessPercent: number,
): void {
  const cornerRadius = (size / 2.0) * (tipRoundnessPercent / 100.0);
  const centerMode =
    (targetGraphics as unknown as { CENTER?: p5.RECT_MODE }).CENTER ||
    ("center" as p5.RECT_MODE);

  targetGraphics.push();
  targetGraphics.rectMode(centerMode);
  targetGraphics.fill(fillColor);
  targetGraphics.noStroke();
  if (cornerRadius >= size / 2.0 - 0.001) {
    targetGraphics.circle(cx, cy, size);
  } else {
    targetGraphics.rect(cx, cy, size, size, cornerRadius);
  }
  targetGraphics.pop();
}
