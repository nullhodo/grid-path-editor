import type {
  GridCell,
  PathChain,
  SketchParameters,
} from "../types/sketch";
import { getLayoutMetrics } from "./renderers/layoutHelper";

/**
 * Checks if two cells have the exact same coordinates.
 */
export function areCellsEqual(a: GridCell, b: GridCell): boolean {
  return a.columnIndex === b.columnIndex && a.rowIndex === b.rowIndex;
}

/**
 * Checks if two cells are 4-directionally adjacent (up, down, left, right).
 */
export function areCellsAdjacent(a: GridCell, b: GridCell): boolean {
  const dc = Math.abs(a.columnIndex - b.columnIndex);
  const dr = Math.abs(a.rowIndex - b.rowIndex);
  return (dc === 1 && dr === 0) || (dc === 0 && dr === 1);
}

/**
 * Checks if a path chain forms a closed loop on the 4-connected grid.
 * (A cycle on a 4-connected grid has length >= 4 with head adjacent to tail)
 */
export function isPathClosed(chain: PathChain): boolean {
  if (chain.length < 4) return false;
  const head = chain[0];
  const tail = chain[chain.length - 1];
  return areCellsAdjacent(head, tail);
}

/**
 * Converts screen/canvas mouse coordinates into grid cell coordinates (col, row).
 * Returns null if the coordinate is outside the grid bounds.
 */
export function getGridCellFromScreenCoords(
  screenX: number,
  screenY: number,
  canvasWidth: number,
  canvasHeight: number,
  params: SketchParameters,
): GridCell | null {
  const { paddingHorizontal, paddingVertical, cellWidth, cellHeight } =
    getLayoutMetrics(canvasWidth, canvasHeight, params);

  const relativeX = screenX - paddingHorizontal;
  const relativeY = screenY - paddingVertical;

  if (relativeX < 0 || relativeY < 0) return null;

  const col = Math.floor(relativeX / cellWidth);
  const row = Math.floor(relativeY / cellHeight);

  if (
    col < 0 ||
    col >= params.gridColumns ||
    row < 0 ||
    row >= params.gridRows
  ) {
    return null;
  }

  return { columnIndex: col, rowIndex: row };
}

/**
 * Interpolates straight orthogonal (Manhattan) steps between cellA and cellB
 * to ensure fast dragging does not miss any intermediate cells.
 */
export function interpolateOrthogonalCells(
  cellA: GridCell,
  cellB: GridCell,
): GridCell[] {
  const steps: GridCell[] = [];
  let currCol = cellA.columnIndex;
  let currRow = cellA.rowIndex;
  const targetCol = cellB.columnIndex;
  const targetRow = cellB.rowIndex;

  // Move horizontally first, then vertically
  const stepCol = targetCol > currCol ? 1 : -1;
  while (currCol !== targetCol) {
    currCol += stepCol;
    steps.push({ columnIndex: currCol, rowIndex: currRow });
  }

  const stepRow = targetRow > currRow ? 1 : -1;
  while (currRow !== targetRow) {
    currRow += stepRow;
    steps.push({ columnIndex: currCol, rowIndex: currRow });
  }

  return steps;
}

/**
 * Deep clones a list of path chains.
 */
export function clonePaths(paths: PathChain[]): PathChain[] {
  return paths.map((chain) => chain.map((cell) => ({ ...cell })));
}

/**
 * Adds a cell into the path chains with intelligent connection, merging, & loop closing:
 * 1. If adjacent to the start node of the active chain (length >= 3), closes the loop.
 * 2. If adjacent to the end of an existing path, append to that path.
 * 3. If adjacent to the start of an existing path, prepend to that path.
 * 4. If connecting the ends of two different paths, merges them into one continuous chain.
 * 5. Otherwise, creates a new isolated path or starts a new chain.
 */
export function addCellToPaths(
  existingPaths: PathChain[],
  targetCell: GridCell,
  activeChainIndex: number | null = null,
): { nextPaths: PathChain[]; updatedChainIndex: number | null } {
  const paths = clonePaths(existingPaths);
  let currentActiveIdx = activeChainIndex;

  // If already matches the latest node of the active chain, do nothing
  if (currentActiveIdx !== null && paths[currentActiveIdx]) {
    const chain = paths[currentActiveIdx];
    if (chain.length > 0) {
      const lastCell = chain[chain.length - 1];
      if (areCellsEqual(lastCell, targetCell)) {
        return { nextPaths: paths, updatedChainIndex: currentActiveIdx };
      }
    }
  }

  // Check if cell already exists anywhere in paths
  let existingChainIdx = -1;
  let existingNodeIdx = -1;
  for (let c = 0; c < paths.length; c++) {
    const idx = paths[c].findIndex((node) =>
      areCellsEqual(node, targetCell),
    );
    if (idx !== -1) {
      existingChainIdx = c;
      existingNodeIdx = idx;
      break;
    }
  }

  // Case 1: Continuing active drawing chain
  if (currentActiveIdx !== null && paths[currentActiveIdx]) {
    const chain = paths[currentActiveIdx];
    const lastCell = chain[chain.length - 1];

    if (areCellsAdjacent(lastCell, targetCell)) {
      // Loop closure: if dragging back to the head of the current chain, close the loop!
      if (
        chain.length >= 3 &&
        existingChainIdx === currentActiveIdx &&
        existingNodeIdx === 0
      ) {
        return { nextPaths: paths, updatedChainIndex: currentActiveIdx };
      }

      // If target cell is already in the active chain at the very end, nothing to do
      if (
        existingChainIdx === currentActiveIdx &&
        existingNodeIdx === chain.length - 1
      ) {
        return { nextPaths: paths, updatedChainIndex: currentActiveIdx };
      }

      // If target cell is part of another chain at end or start, merge them!
      if (
        existingChainIdx !== -1 &&
        existingChainIdx !== currentActiveIdx
      ) {
        const otherChain = paths[existingChainIdx];
        if (existingNodeIdx === 0) {
          // Merge otherChain to the end of chain
          chain.push(...otherChain);
          paths.splice(existingChainIdx, 1);
          const newIdx =
            existingChainIdx < currentActiveIdx
              ? currentActiveIdx - 1
              : currentActiveIdx;
          return { nextPaths: paths, updatedChainIndex: newIdx };
        }
        if (existingNodeIdx === otherChain.length - 1) {
          // Reverse otherChain and merge
          otherChain.reverse();
          chain.push(...otherChain);
          paths.splice(existingChainIdx, 1);
          const newIdx =
            existingChainIdx < currentActiveIdx
              ? currentActiveIdx - 1
              : currentActiveIdx;
          return { nextPaths: paths, updatedChainIndex: newIdx };
        }
      }

      // If cell already existed in the middle of a path, remove that old reference
      if (existingChainIdx !== -1) {
        paths[existingChainIdx].splice(existingNodeIdx, 1);
        if (paths[existingChainIdx].length === 0) {
          paths.splice(existingChainIdx, 1);
          if (existingChainIdx < currentActiveIdx) {
            currentActiveIdx--;
          }
        }
      }

      chain.push({ ...targetCell });
      return { nextPaths: paths, updatedChainIndex: currentActiveIdx };
    }
  }

  // Case 2: Starting a new stroke or connecting to an existing end/start node
  for (let c = 0; c < paths.length; c++) {
    const chain = paths[c];
    if (chain.length === 0) continue;

    const tail = chain[chain.length - 1];
    const head = chain[0];

    // If chain is already closed, don't accidentally extend it unless modifying
    if (isPathClosed(chain)) continue;

    if (areCellsAdjacent(tail, targetCell)) {
      if (chain.length >= 3 && areCellsEqual(head, targetCell)) {
        // Closed loop formed!
        return { nextPaths: paths, updatedChainIndex: c };
      }
      // Append to tail
      chain.push({ ...targetCell });
      return { nextPaths: paths, updatedChainIndex: c };
    }

    if (areCellsAdjacent(head, targetCell)) {
      if (chain.length >= 3 && areCellsEqual(tail, targetCell)) {
        // Closed loop formed!
        return { nextPaths: paths, updatedChainIndex: c };
      }
      // Prepend to head
      chain.unshift({ ...targetCell });
      return { nextPaths: paths, updatedChainIndex: c };
    }
  }

  // Case 3: Target cell does not connect to any existing chain
  if (existingChainIdx !== -1) {
    return { nextPaths: paths, updatedChainIndex: existingChainIdx };
  }

  // Create new isolated path
  paths.push([{ ...targetCell }]);
  return { nextPaths: paths, updatedChainIndex: paths.length - 1 };
}

/**
 * Erases a cell from the path chains.
 * If the cell is in a closed loop, unrolls the loop into an open path.
 * If the cell is in the middle of an open path, splits the path into two sub-paths.
 */
export function eraseCellFromPaths(
  existingPaths: PathChain[],
  targetCell: GridCell,
): PathChain[] {
  const result: PathChain[] = [];

  for (const chain of existingPaths) {
    const cellIndex = chain.findIndex((node) =>
      areCellsEqual(node, targetCell),
    );

    if (cellIndex === -1) {
      // Not in this chain, keep it
      result.push(chain.map((c) => ({ ...c })));
    } else {
      if (isPathClosed(chain)) {
        // Unroll closed loop into an open chain
        const N = chain.length;
        const unrolled: GridCell[] = [];
        for (let i = 1; i < N; i++) {
          const idx = (cellIndex + i) % N;
          unrolled.push({ ...chain[idx] });
        }
        if (unrolled.length > 0) {
          result.push(unrolled);
        }
      } else {
        // Split open chain into before and after
        const before = chain.slice(0, cellIndex);
        const after = chain.slice(cellIndex + 1);

        if (before.length > 0) {
          result.push(before.map((c) => ({ ...c })));
        }
        if (after.length > 0) {
          result.push(after.map((c) => ({ ...c })));
        }
      }
    }
  }

  return result;
}

/**
 * Reverses all path chains (flips start and end).
 */
export function reverseAllPaths(existingPaths: PathChain[]): PathChain[] {
  return existingPaths.map((chain) =>
    [...chain].reverse().map((c) => ({ ...c })),
  );
}

/**
 * Clears all paths.
 */
export function clearAllPaths(): PathChain[] {
  return [];
}
