import { motion } from "framer-motion";
import { useAtom } from "jotai";
import {
  ArrowLeftRightIcon,
  EraserIcon,
  PencilIcon,
  RedoIcon,
  Trash2Icon,
  UndoIcon,
} from "lucide-react";
import type React from "react";
import {
  historyPointerAtom,
  historyStackAtom,
  pathChainsAtom,
} from "../state/sketchStore";

interface Props {
  onClearPaths: () => void;
  onReversePaths: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const EditorToolbar: React.FC<Props> = ({
  onClearPaths,
  onReversePaths,
  onUndo,
  onRedo,
}) => {
  const [pathChains] = useAtom(pathChainsAtom);
  const [historyStack] = useAtom(historyStackAtom);
  const [historyPointer] = useAtom(historyPointerAtom);

  const canUndo = historyPointer > 0;
  const canRedo = historyPointer < historyStack.length - 1;

  // Calculate statistics
  const totalCells = pathChains.reduce(
    (sum, chain) => sum + chain.length,
    0,
  );

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xl border border-gray-200/90 text-gray-800 pointer-events-auto select-none"
    >
      {/* Mouse Controls Guidance Badge */}
      <div
        className="flex items-center gap-2 bg-gray-100/90 px-2.5 py-1.5 rounded-lg border border-gray-200/80 text-xs font-medium text-gray-700"
        title="キャンバス上での操作方法: 左クリック長押しで描画、右クリック長押しで消去"
      >
        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
          <PencilIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>左: 描画</span>
        </span>
        <span className="text-gray-300">/</span>
        <span className="flex items-center gap-1 text-rose-700 font-semibold">
          <EraserIcon className="w-3.5 h-3.5 text-rose-600" />
          <span>右: 消去</span>
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-0.5" />

      {/* Path Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onClearPaths}
          title="すべてのパスを消去 (Cキー)"
          className="p-2 text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer text-xs flex items-center justify-center"
        >
          <Trash2Icon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onReversePaths}
          title="パスの向き（始点・終点）を反転"
          className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer text-xs flex items-center justify-center"
        >
          <ArrowLeftRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-0.5" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          title="元に戻す (Ctrl+Z)"
          className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
        >
          <UndoIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          title="やり直す (Ctrl+Y / Ctrl+Shift+Z)"
          className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
        >
          <RedoIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-0.5" />

      {/* Path Stats Badge */}
      <div className="px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200/80 flex items-center gap-1.5 text-[11px] text-gray-600 select-none">
        <span title="パス本数">
          <strong className="text-gray-900 font-semibold">
            {pathChains.length}
          </strong>{" "}
          パス
        </span>
        <span className="text-gray-300">•</span>
        <span title="使用セル数">
          <strong className="text-gray-900 font-semibold">
            {totalCells}
          </strong>{" "}
          セル
        </span>
      </div>
    </motion.div>
  );
};
