import { useAtom } from "jotai";
import p5 from "p5";
import p5Svg from "p5.js-svg";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { ControlPanel } from "./components/ControlPanel";
import { EditorToolbar } from "./components/EditorToolbar";
import { RecordingOverlay } from "./components/RecordingOverlay";
import { LightAngleOverlay } from "./components/overlays/LightAngleOverlay";
import { exportHighResImage, exportSvgGraphics } from "./core/exporter";
import {
  areCellsEqual,
  getGridCellFromScreenCoords,
  interpolateOrthogonalCells,
} from "./core/pathEditor";
import { VideoRecorderManager } from "./core/recorder";
import {
  renderDebugInformation,
  renderPathsGraphics,
} from "./core/renderer";
import { renderCmykPrintOverlay } from "./core/renderers/cmykRenderer";
import { renderDitheringOverlay } from "./core/renderers/ditheringRenderer";
import { renderEditorOverlay } from "./core/renderers/editorOverlay";
import { renderGrainOverlay } from "./core/renderers/grainOverlay";
import { renderHalftoneScreenOverlay } from "./core/renderers/halftoneRenderer";
import { renderInkBleedOverlay } from "./core/renderers/inkBleedRenderer";
import { renderPaperTextureOverlay } from "./core/renderers/paperTextureRenderer";
import { renderRelief3dOverlay } from "./core/renderers/relief3dRenderer";
import { renderRisoPrintOverlay } from "./core/renderers/risoRenderer";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSketchHandlers } from "./hooks/useSketchHandlers";
import "./index.css";
import {
  editorToolAtom,
  hoveredCellAtom,
  isDrawingAtom,
  isPanelOpenAtom,
  pathChainsAtom,
  recordingStateAtom,
  sketchParamsAtom,
} from "./state/sketchStore";
import type { EditorTool, GridCell } from "./types/sketch";

// Initialize p5 SVG plugin
p5Svg(p5);

// Add [DEV] prefix to tab title in local development mode
if (import.meta.env.DEV && !document.title.startsWith("[DEV] ")) {
  document.title = `[DEV] ${document.title}`;
}

const App: React.FC = () => {
  const [params] = useAtom(sketchParamsAtom);
  const [pathChains] = useAtom(pathChainsAtom);
  const [editorTool, setEditorTool] = useAtom(editorToolAtom);
  const [hoveredCell, setHoveredCell] = useAtom(hoveredCellAtom);
  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [, setIsPanelOpen] = useAtom(isPanelOpenAtom);
  const [, setRecordingState] = useAtom(recordingStateAtom);

  const p5InstanceRef = useRef<p5 | null>(null);
  const recorderRef = useRef<VideoRecorderManager | null>(null);

  // Keep fresh references for use inside closures and draw loop
  const paramsRef = useRef(params);
  const pathChainsRef = useRef(pathChains);
  const editorToolRef = useRef(editorTool);
  const hoveredCellRef = useRef(hoveredCell);
  const isDrawingRef = useRef(isDrawing);
  const lastTouchedCellRef = useRef<GridCell | null>(null);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);
  useEffect(() => {
    pathChainsRef.current = pathChains;
  }, [pathChains]);
  useEffect(() => {
    editorToolRef.current = editorTool;
  }, [editorTool]);
  useEffect(() => {
    hoveredCellRef.current = hoveredCell;
  }, [hoveredCell]);
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  const {
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
  } = useSketchHandlers(p5InstanceRef);

  const handleStartRecord = async () => {
    if (recorderRef.current) {
      await recorderRef.current.startRecording();
    }
  };

  const handleStopRecord = async () => {
    if (recorderRef.current) {
      await recorderRef.current.stopRecording();
    }
  };

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onClearPaths: handleClearAllPaths,
    onTogglePanel: () => setIsPanelOpen((prev) => !prev),
  });

  // Mount p5.js instance
  useEffect(() => {
    const container = document.getElementById("canvas-container");
    if (!container) return;

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    container.addEventListener("contextmenu", onContextMenu);

    const sketch = (p: p5) => {
      let offscreenBuffer: p5.Graphics | null = null;
      let lastRenderKey = "";

      p.setup = () => {
        const c = p.createCanvas(
          container.clientWidth,
          container.clientHeight,
        );
        c.parent("canvas-container");
        p.frameRate(60);

        offscreenBuffer = p.createGraphics(
          container.clientWidth,
          container.clientHeight,
        );

        recorderRef.current = new VideoRecorderManager(
          c.elt as HTMLCanvasElement,
          (recording, elapsedSeconds) => {
            setRecordingState({ isRecording: recording, elapsedSeconds });
          },
        );

        p5InstanceRef.current = p;
      };

      p.mouseMoved = () => {
        const cell = getGridCellFromScreenCoords(
          p.mouseX,
          p.mouseY,
          p.width,
          p.height,
          paramsRef.current,
        );
        setHoveredCell(cell);
        hoveredCellRef.current = cell;
      };

      p.mousePressed = (e?: MouseEvent) => {
        const target = e?.target as HTMLElement | null;
        if (target && target.tagName !== "CANVAS") return;

        // Determine tool: Left click (button 0) = draw, Right click (button 2) = erase
        let tool: EditorTool = "draw";
        if (e) {
          if (e.button === 2 || p.mouseButton === p.RIGHT) {
            tool = "erase";
          } else if (e.button === 0 || p.mouseButton === p.LEFT) {
            tool = "draw";
          } else {
            return;
          }
        } else if (p.mouseButton === p.RIGHT) {
          tool = "erase";
        } else if (p.mouseButton === p.LEFT) {
          tool = "draw";
        } else {
          return;
        }

        const cell = getGridCellFromScreenCoords(
          p.mouseX,
          p.mouseY,
          p.width,
          p.height,
          paramsRef.current,
        );

        if (cell) {
          setEditorTool(tool);
          editorToolRef.current = tool;
          setIsDrawing(true);
          isDrawingRef.current = true;
          lastTouchedCellRef.current = cell;

          if (tool === "draw") {
            handleCellDraw(cell, false);
          } else {
            handleCellErase(cell);
          }
        }
      };

      p.mouseDragged = (e?: MouseEvent) => {
        if (!isDrawingRef.current) return;
        const target = e?.target as HTMLElement | null;
        if (target && target.tagName !== "CANVAS") return;

        const cell = getGridCellFromScreenCoords(
          p.mouseX,
          p.mouseY,
          p.width,
          p.height,
          paramsRef.current,
        );

        if (cell) {
          setHoveredCell(cell);
          hoveredCellRef.current = cell;

          const lastCell = lastTouchedCellRef.current;
          if (!lastCell || !areCellsEqual(lastCell, cell)) {
            const steps = lastCell
              ? interpolateOrthogonalCells(lastCell, cell)
              : [cell];

            for (const step of steps) {
              if (editorToolRef.current === "draw") {
                handleCellDraw(step, true);
              } else if (editorToolRef.current === "erase") {
                handleCellErase(step);
              }
            }
            lastTouchedCellRef.current = cell;
          }
        }
      };

      p.mouseReleased = () => {
        if (isDrawingRef.current) {
          setIsDrawing(false);
          isDrawingRef.current = false;
          lastTouchedCellRef.current = null;
          handleFinishStroke();
        }
      };

      p.draw = () => {
        if (!offscreenBuffer) return;

        const currentParams = paramsRef.current;
        const currentPaths = pathChainsRef.current;

        // Render key to detect state updates and canvas dimensions
        const renderKey = `${JSON.stringify(currentParams)}_${JSON.stringify(currentPaths)}_${offscreenBuffer.width}x${offscreenBuffer.height}`;
        const isStateChanged = renderKey !== lastRenderKey;

        if (isStateChanged) {
          lastRenderKey = renderKey;

          // Draw state into offscreenBuffer only when state or dimensions change
          offscreenBuffer.background(currentParams.backgroundColor);
          renderPathsGraphics(
            offscreenBuffer,
            offscreenBuffer.width,
            offscreenBuffer.height,
            currentParams,
            currentPaths,
          );

          if (currentParams.show3dShadow) {
            renderRelief3dOverlay(
              p,
              offscreenBuffer,
              offscreenBuffer.width,
              offscreenBuffer.height,
              currentParams,
              currentPaths,
            );
          }

          if (currentParams.showGrain) {
            renderGrainOverlay(
              offscreenBuffer,
              offscreenBuffer.width,
              offscreenBuffer.height,
              currentParams.grainIntensity || 0.15,
            );
          }

          if (currentParams.showCmyk) {
            renderCmykPrintOverlay(
              p,
              offscreenBuffer,
              offscreenBuffer.width,
              offscreenBuffer.height,
              currentParams.cmykOffsetFactor !== undefined
                ? currentParams.cmykOffsetFactor
                : 0.35,
              currentParams.cmykIntensity !== undefined
                ? currentParams.cmykIntensity
                : 0.9,
              currentParams.backgroundColor,
            );
          }

          if (currentParams.showRiso) {
            renderRisoPrintOverlay(
              p,
              offscreenBuffer,
              offscreenBuffer.width,
              offscreenBuffer.height,
              currentParams.risoOffsetPx || 3,
              currentParams.risoIntensity || 0.25,
            );
          }

          if (currentParams.showHalftone) {
            renderHalftoneScreenOverlay(
              p,
              offscreenBuffer,
              offscreenBuffer.width,
              offscreenBuffer.height,
              currentParams.halftoneSize || 6,
              currentParams.halftoneAngle || 45,
            );
          }

          if (currentParams.showDithering) {
            renderDitheringOverlay(
              p,
              offscreenBuffer,
              offscreenBuffer.width,
              offscreenBuffer.height,
              currentParams.ditheringScale || 2,
              currentParams.ditheringLevels || 4,
            );
          }

          if (currentParams.showInkBleed) {
            renderInkBleedOverlay(
              p,
              offscreenBuffer,
              offscreenBuffer.width,
              offscreenBuffer.height,
              currentParams.inkBleedAmount || 4,
              currentParams.inkBleedRoughness || 0.4,
            );
          }

          if (currentParams.showPaperTexture) {
            renderPaperTextureOverlay(
              p,
              offscreenBuffer,
              offscreenBuffer.width,
              offscreenBuffer.height,
              currentParams.paperRoughness || 0.35,
              currentParams.paperColorDensity || 0.2,
            );
          }
        }

        // Render buffer onto main canvas
        p.background(currentParams.backgroundColor);
        p.image(offscreenBuffer, 0, 0);

        // Draw Interactive Editor Overlay (Hover frame, tool indicator)
        renderEditorOverlay(
          p,
          p,
          p.width,
          p.height,
          currentParams,
          hoveredCellRef.current,
          editorToolRef.current,
          isDrawingRef.current,
        );

        if (currentParams.debugMode) {
          renderDebugInformation(
            p,
            p.width,
            p.height,
            currentParams,
            currentPaths,
          );
        }
      };

      p.windowResized = () => {
        if (container) {
          p.resizeCanvas(container.clientWidth, container.clientHeight);
          if (offscreenBuffer) {
            offscreenBuffer.resizeCanvas(
              container.clientWidth,
              container.clientHeight,
            );
          }

          const pContainer = p as unknown as {
            canvas?: HTMLCanvasElement;
          };
          if (recorderRef.current && pContainer.canvas) {
            recorderRef.current.setCanvas(pContainer.canvas);
          }
        }
      };
    };

    const p5Inst = new p5(sketch);

    return () => {
      container.removeEventListener("contextmenu", onContextMenu);
      p5Inst.remove();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950 flex select-none">
      <div
        id="canvas-container"
        className="relative flex-1 h-full w-full cursor-crosshair"
      />
      <EditorToolbar
        onClearPaths={handleClearAllPaths}
        onReversePaths={handleReversePaths}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <LightAngleOverlay />
      <RecordingOverlay onStopRecord={handleStopRecord} />
      <ControlPanel
        onParamChange={handleParamChange}
        onToggleBorderOption={handleToggleBorderOption}
        onApplyPalette={handleApplyPalette}
        onGenerateGradientTheme={handleGenerateGradientTheme}
        onExportJpg={() => {
          if (p5InstanceRef.current) {
            exportHighResImage(
              p5InstanceRef.current,
              paramsRef.current,
              pathChainsRef.current,
              2880,
              2880,
            );
          }
        }}
        onExportSvg={() => {
          if (p5InstanceRef.current) {
            exportSvgGraphics(
              p5InstanceRef.current,
              paramsRef.current,
              pathChainsRef.current,
            );
          }
        }}
        onStartRecord={handleStartRecord}
        onStopRecord={handleStopRecord}
        onImportJson={handleImportJson}
        onExportJson={handleExportJson}
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
