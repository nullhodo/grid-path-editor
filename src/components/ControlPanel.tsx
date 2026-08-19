import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { SlidersIcon, XIcon } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";
import { isPanelOpenAtom } from "../state/sketchStore";
import type {
  BorderOptionKey,
  SketchParamValue,
  SketchParameters,
} from "../types/sketch";
import { ColorPaletteSection } from "./sections/ColorPaletteSection";
import { ExportSection } from "./sections/ExportSection";
import { GridLayoutSection } from "./sections/GridLayoutSection";
import { GridLinesSection } from "./sections/GridLinesSection";
import { RenderingStyleSection } from "./sections/RenderingStyleSection";

interface Props {
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
  onToggleBorderOption: (key: BorderOptionKey) => void;
  onApplyPalette: (idx: number) => void;
  onGenerateGradientTheme: (baseHex: string) => void;
  onExportJpg: () => void;
  onExportSvg: () => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJson: () => void;
}

export const ControlPanel: React.FC<Props> = ({
  onParamChange,
  onToggleBorderOption,
  onApplyPalette,
  onGenerateGradientTheme,
  onExportJpg,
  onExportSvg,
  onStartRecord,
  onStopRecord,
  onImportJson,
  onExportJson,
}) => {
  const [isOpen, setIsOpen] = useAtom(isPanelOpenAtom);
  const panelContainerRef = useRef<HTMLDivElement>(null);

  // Close panel on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (!isOpen) return;
      if (
        panelContainerRef.current &&
        !panelContainerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isOpen, setIsOpen]);

  return (
    <>
      {/* Floating Toggle Button (Visible ONLY when Panel is Closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="ツールウィンドウの表示 (Hキー)"
          className="absolute top-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-900 p-2.5 rounded-md shadow-md backdrop-blur-md border border-gray-300 transition flex items-center gap-2 cursor-pointer"
        >
          <SlidersIcon className="w-4 h-4 text-gray-800" />
          <span className="text-xs font-semibold">ツール設定</span>
        </button>
      )}

      {/* Sidebar Layout */}
      <AnimatePresence>
        {isOpen && (
          <div
            ref={panelContainerRef}
            className="absolute top-4 left-4 bottom-4 flex items-start z-40 pointer-events-none"
          >
            {/* Main Panel */}
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-96 h-full bg-white/95 backdrop-blur-md text-gray-900 rounded-md shadow-xl border border-gray-200 flex flex-col overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="p-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/90">
                <div className="flex items-center gap-2">
                  <SlidersIcon className="w-4 h-4 text-gray-800" />
                  <span className="text-xs font-bold tracking-wide text-gray-900">
                    ツール設定
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-900 p-1 rounded hover:bg-gray-200/60 transition cursor-pointer"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-xs">
                <GridLayoutSection onParamChange={onParamChange} />
                <GridLinesSection
                  onParamChange={onParamChange}
                  onToggleBorderOption={onToggleBorderOption}
                />
                <ColorPaletteSection
                  onApplyPalette={onApplyPalette}
                  onGenerateGradientTheme={onGenerateGradientTheme}
                  onParamChange={onParamChange}
                />
                <RenderingStyleSection onParamChange={onParamChange} />
                <ExportSection
                  onExportJpg={onExportJpg}
                  onExportSvg={onExportSvg}
                  onStartRecord={onStartRecord}
                  onStopRecord={onStopRecord}
                  onImportJson={onImportJson}
                  onExportJson={onExportJson}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
