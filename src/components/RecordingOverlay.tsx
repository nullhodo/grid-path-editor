import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { SquareIcon } from "lucide-react";
import type React from "react";
import { recordingStateAtom } from "../state/sketchStore";

interface Props {
  onStopRecord: () => void;
}

export const RecordingOverlay: React.FC<Props> = ({ onStopRecord }) => {
  const [recordingState] = useAtom(recordingStateAtom);

  if (!recordingState.isRecording) return null;

  const formatTimer = (secs: number) => {
    const mins = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${mins}:${s}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed top-16 right-4 z-50 pointer-events-auto bg-gray-950/90 text-white rounded-lg p-3 shadow-2xl border border-red-500/40 backdrop-blur-md min-w-[200px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            <span className="text-xs font-bold tracking-wider text-red-400">
              動画録画中 (REC)
            </span>
          </div>

          <button
            type="button"
            onClick={onStopRecord}
            title="録画を停止して保存します"
            className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
          >
            <SquareIcon className="w-3 h-3 fill-white" />
            停止
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-300 pt-2 mt-2 border-t border-gray-800">
          <span className="text-[11px]">経過時間:</span>
          <span className="font-mono font-bold text-white text-sm">
            {formatTimer(recordingState.elapsedSeconds)}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
