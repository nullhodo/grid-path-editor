import type p5 from "p5";
import type {
  EditorTool,
  GridCell,
  SketchParameters,
} from "../../types/sketch";
import { getLayoutMetrics } from "./layoutHelper";

/**
 * Draws real-time editor interaction overlays:
 * - Idle hover cursor frame
 * - Left-click drag: emerald green draw highlight
 * - Right-click drag: rose red erase highlight with cross indicator
 */
export function renderEditorOverlay(
  _p: p5,
  targetGraphics: p5 | p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  params: SketchParameters,
  hoveredCell: GridCell | null,
  activeTool: EditorTool,
  isDrawing: boolean,
): void {
  if (!hoveredCell) return;

  const { paddingHorizontal, paddingVertical, cellWidth, cellHeight } =
    getLayoutMetrics(canvasWidth, canvasHeight, params);

  const cellX = paddingHorizontal + hoveredCell.columnIndex * cellWidth;
  const cellY = paddingVertical + hoveredCell.rowIndex * cellHeight;
  const centerX = cellX + cellWidth * 0.5;
  const centerY = cellY + cellHeight * 0.5;

  targetGraphics.push();

  if (isDrawing && activeTool === "erase") {
    // Erase mode (Right-click drag): Red warning tint + diagonal cross
    targetGraphics.noStroke();
    targetGraphics.fill(239, 68, 68, 85); // Rose red tint
    targetGraphics.rect(cellX, cellY, cellWidth, cellHeight, 4);

    targetGraphics.stroke(239, 68, 68, 230);
    targetGraphics.strokeWeight(2);
    targetGraphics.noFill();
    targetGraphics.rect(
      cellX + 1,
      cellY + 1,
      cellWidth - 2,
      cellHeight - 2,
      4,
    );

    // Cross icon inside cell
    const crossSize = Math.min(cellWidth, cellHeight) * 0.28;
    targetGraphics.stroke(255, 255, 255, 240);
    targetGraphics.strokeWeight(2);
    targetGraphics.line(
      centerX - crossSize,
      centerY - crossSize,
      centerX + crossSize,
      centerY + crossSize,
    );
    targetGraphics.line(
      centerX + crossSize,
      centerY - crossSize,
      centerX - crossSize,
      centerY + crossSize,
    );
  } else if (isDrawing && activeTool === "draw") {
    // Draw mode (Left-click drag): Emerald green glowing highlight + solid border
    targetGraphics.noStroke();
    targetGraphics.fill(16, 185, 129, 75); // Emerald green tint
    targetGraphics.rect(cellX, cellY, cellWidth, cellHeight, 4);

    targetGraphics.stroke(16, 185, 129, 240);
    targetGraphics.strokeWeight(2);
    targetGraphics.noFill();
    targetGraphics.rect(
      cellX + 1,
      cellY + 1,
      cellWidth - 2,
      cellHeight - 2,
      4,
    );

    // Center dot indicator
    targetGraphics.fill(255, 255, 255, 240);
    targetGraphics.noStroke();
    targetGraphics.circle(
      centerX,
      centerY,
      Math.min(cellWidth, cellHeight) * 0.25,
    );
  } else {
    // Idle hover frame: Crisp subtle selector frame
    targetGraphics.noStroke();
    targetGraphics.fill(255, 255, 255, 30);
    targetGraphics.rect(cellX, cellY, cellWidth, cellHeight, 4);

    targetGraphics.stroke(255, 255, 255, 180);
    targetGraphics.strokeWeight(1.5);
    targetGraphics.noFill();
    targetGraphics.rect(
      cellX + 1,
      cellY + 1,
      cellWidth - 2,
      cellHeight - 2,
      4,
    );

    // Subtle center dot
    targetGraphics.fill(255, 255, 255, 160);
    targetGraphics.noStroke();
    targetGraphics.circle(
      centerX,
      centerY,
      Math.min(cellWidth, cellHeight) * 0.15,
    );
  }

  targetGraphics.pop();
}
