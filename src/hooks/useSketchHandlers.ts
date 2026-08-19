import { useAtom } from "jotai";
import type p5 from "p5";
import type React from "react";
import { useEffect, useRef } from "react";
import { PALETTES } from "../constants/palettes";
import { exportJsonSettings, parseJsonSettings } from "../core/exporter";
import {
  addCellToPaths,
  clearAllPaths,
  eraseCellFromPaths,
  reverseAllPaths,
} from "../core/pathEditor";
import {
  historyPointerAtom,
  historyStackAtom,
  pathChainsAtom,
  sketchParamsAtom,
} from "../state/sketchStore";
import type {
  BorderOptionKey,
  GridCell,
  PathChain,
  SketchParamValue,
  SketchParameters,
} from "../types/sketch";

export interface UseSketchHandlersResult {
  handleParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
  handleToggleBorderOption: (key: BorderOptionKey) => void;
  handleApplyPalette: (paletteIndex: number) => void;
  handleGenerateGradientTheme: (baseHex: string) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleImportJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleExportJson: () => void;
  // Manual Editing Handlers
  handleCellDraw: (cell: GridCell, isContinuing: boolean) => void;
  handleCellErase: (cell: GridCell) => void;
  handleFinishStroke: () => void;
  handleClearAllPaths: () => void;
  handleReversePaths: () => void;
}

/**
 * Custom hook that encapsulates sketch parameter handlers,
 * manual drawing/erasing, and undo/redo history.
 */
export function useSketchHandlers(
  p5InstanceRef: React.RefObject<p5 | null>,
): UseSketchHandlersResult {
  const [params, setParams] = useAtom(sketchParamsAtom);
  const [pathChains, setPathChains] = useAtom(pathChainsAtom);
  const [historyStack, setHistoryStack] = useAtom(historyStackAtom);
  const [historyPointer, setHistoryPointer] = useAtom(historyPointerAtom);

  const paramsRef = useRef(params);
  const pathChainsRef = useRef(pathChains);
  const historyStackRef = useRef(historyStack);
  const historyPointerRef = useRef(historyPointer);
  const activeDrawingChainIndexRef = useRef<number | null>(null);
  const isDirtyStrokeRef = useRef(false);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    pathChainsRef.current = pathChains;
  }, [pathChains]);

  useEffect(() => {
    historyStackRef.current = historyStack;
  }, [historyStack]);

  useEffect(() => {
    historyPointerRef.current = historyPointer;
  }, [historyPointer]);

  const pushHistory = (
    newParams: SketchParameters,
    newPaths: PathChain[] = pathChainsRef.current,
  ) => {
    const currentPointer = historyPointerRef.current;
    const currentStack = historyStackRef.current;
    const sliced = currentStack.slice(0, currentPointer + 1);
    const updated = [
      ...sliced,
      {
        params: JSON.parse(JSON.stringify(newParams)),
        pathChains: JSON.parse(JSON.stringify(newPaths)),
      },
    ];
    if (updated.length > 50) updated.shift();
    const nextPointer = updated.length - 1;

    historyStackRef.current = updated;
    historyPointerRef.current = nextPointer;
    setHistoryStack(updated);
    setHistoryPointer(nextPointer);
  };

  const handleParamChange = (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => {
    setParams((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "gridRows" || key === "gridColumns") {
        // Filter out cells that fall outside the new grid bounds
        const rows =
          typeof val === "number" && key === "gridRows"
            ? val
            : prev.gridRows;
        const cols =
          typeof val === "number" && key === "gridColumns"
            ? val
            : prev.gridColumns;
        const trimmedPaths = pathChainsRef.current
          .map((chain) =>
            chain.filter(
              (cell) => cell.columnIndex < cols && cell.rowIndex < rows,
            ),
          )
          .filter((chain) => chain.length > 0);
        setPathChains(trimmedPaths);
        pathChainsRef.current = trimmedPaths;
        pushHistory(next, trimmedPaths);
      } else {
        pushHistory(next, pathChainsRef.current);
      }
      return next;
    });
  };

  const handleToggleBorderOption = (key: BorderOptionKey) => {
    setParams((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      pushHistory(next, pathChainsRef.current);
      return next;
    });
  };

  const handleApplyPalette = (paletteIndex: number) => {
    const palette = PALETTES[paletteIndex];
    if (!palette || palette.colors.length === 0) return;

    const colors = palette.colors.map((c) => c.hex);
    const bg = colors[0];
    const objectCandidates = colors.slice(1);

    let outline = "#22c55e";
    let core = "#ef4444";
    let gridLine = "#475569";

    if (objectCandidates.length >= 3) {
      outline = objectCandidates[0];
      core = objectCandidates[1];
      gridLine = objectCandidates[2];
    } else if (objectCandidates.length === 2) {
      outline = objectCandidates[0];
      core = objectCandidates[1];
      gridLine = objectCandidates[0];
    } else if (objectCandidates.length === 1) {
      outline = objectCandidates[0];
      core = "#FFFFFF";
      gridLine = objectCandidates[0];
    }

    setParams((prev) => {
      const next: SketchParameters = {
        ...prev,
        paletteIndex,
        backgroundColor: bg,
        outlineColor: outline,
        coreColor: core,
        gridLineColor: gridLine,
        dotColor: "#FFFFFF",
      };
      pushHistory(next, pathChainsRef.current);
      return next;
    });
  };

  const handleGenerateGradientTheme = (baseHex: string) => {
    if (!p5InstanceRef.current) return;
    const p = p5InstanceRef.current;

    p.push();
    p.colorMode(p.HSB, 360, 100, 100);
    const baseCol = p.color(baseHex);
    const baseHue = p.hue(baseCol);
    const baseSat = p.saturation(baseCol);
    const baseBright = p.brightness(baseCol);

    const bgHex = p
      .color(baseHue, Math.max(10, baseSat * 0.25), 12)
      .toString("#rrggbb");
    const outlineHex = p
      .color(
        baseHue,
        Math.min(100, baseSat * 1.1),
        Math.min(100, Math.max(70, baseBright)),
      )
      .toString("#rrggbb");
    const coreHex = p
      .color((baseHue + 35) % 360, Math.min(100, baseSat * 1.2), 95)
      .toString("#rrggbb");
    const gridLineHex = p
      .color(baseHue, Math.max(15, baseSat * 0.4), 35)
      .toString("#rrggbb");
    p.pop();

    setParams((prev) => {
      const next: SketchParameters = {
        ...prev,
        backgroundColor: bgHex,
        outlineColor: outlineHex,
        coreColor: coreHex,
        gridLineColor: gridLineHex,
        dotColor: "#FFFFFF",
      };
      pushHistory(next, pathChainsRef.current);
      return next;
    });
  };

  const handleUndo = () => {
    const currentPointer = historyPointerRef.current;
    const currentStack = historyStackRef.current;
    if (currentPointer > 0) {
      const prevPointer = currentPointer - 1;
      const targetState = currentStack[prevPointer];
      historyPointerRef.current = prevPointer;
      setHistoryPointer(prevPointer);
      setParams(targetState.params);
      paramsRef.current = targetState.params;
      setPathChains(targetState.pathChains);
      pathChainsRef.current = targetState.pathChains;
    }
  };

  const handleRedo = () => {
    const currentPointer = historyPointerRef.current;
    const currentStack = historyStackRef.current;
    if (currentPointer < currentStack.length - 1) {
      const nextPointer = currentPointer + 1;
      const targetState = currentStack[nextPointer];
      historyPointerRef.current = nextPointer;
      setHistoryPointer(nextPointer);
      setParams(targetState.params);
      paramsRef.current = targetState.params;
      setPathChains(targetState.pathChains);
      pathChainsRef.current = targetState.pathChains;
    }
  };

  // Manual Editing Handlers
  const handleCellDraw = (cell: GridCell, isContinuing: boolean) => {
    if (!isContinuing) {
      activeDrawingChainIndexRef.current = null;
    }

    const { nextPaths, updatedChainIndex } = addCellToPaths(
      pathChainsRef.current,
      cell,
      activeDrawingChainIndexRef.current,
    );

    activeDrawingChainIndexRef.current = updatedChainIndex;
    setPathChains(nextPaths);
    pathChainsRef.current = nextPaths;
    isDirtyStrokeRef.current = true;
  };

  const handleCellErase = (cell: GridCell) => {
    const nextPaths = eraseCellFromPaths(pathChainsRef.current, cell);
    setPathChains(nextPaths);
    pathChainsRef.current = nextPaths;
    isDirtyStrokeRef.current = true;
  };

  const handleFinishStroke = () => {
    activeDrawingChainIndexRef.current = null;
    if (isDirtyStrokeRef.current) {
      pushHistory(paramsRef.current, pathChainsRef.current);
      isDirtyStrokeRef.current = false;
    }
  };

  const handleClearAllPaths = () => {
    const nextPaths = clearAllPaths();
    setPathChains(nextPaths);
    pathChainsRef.current = nextPaths;
    pushHistory(paramsRef.current, nextPaths);
  };

  const handleReversePaths = () => {
    const nextPaths = reverseAllPaths(pathChainsRef.current);
    setPathChains(nextPaths);
    pathChainsRef.current = nextPaths;
    pushHistory(paramsRef.current, nextPaths);
  };

  const handleImportJson = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const result = parseJsonSettings(raw);
        if (result.params) {
          setParams(result.params);
          let loadedPaths: PathChain[] = [];
          if (result.pathChains && result.pathChains.length > 0) {
            loadedPaths = result.pathChains;
          }
          setPathChains(loadedPaths);
          pathChainsRef.current = loadedPaths;
          pushHistory(result.params, loadedPaths);
        }
      } catch (err) {
        console.error("[JSON Import Error]", err);
        alert(
          "JSONファイルの読み込みに失敗しました。正しいフォーマットかご確認ください。",
        );
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleExportJson = () => {
    exportJsonSettings(paramsRef.current, pathChainsRef.current);
  };

  return {
    handleParamChange,
    handleToggleBorderOption,
    handleApplyPalette,
    handleGenerateGradientTheme,
    handleUndo,
    handleRedo,
    handleImportJson,
    handleExportJson,
    handleCellDraw,
    handleCellErase,
    handleFinishStroke,
    handleClearAllPaths,
    handleReversePaths,
  };
}
