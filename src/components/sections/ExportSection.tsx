import { useAtom } from "jotai";
import {
  FileCodeIcon,
  FileDownIcon,
  FileImageIcon,
  FileTypeIcon,
  VideoIcon,
} from "lucide-react";
import type React from "react";
import { recordingStateAtom } from "../../state/sketchStore";

interface Props {
  onExportJpg: () => void;
  onExportSvg: () => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onImportJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJson: () => void;
}

export const ExportSection: React.FC<Props> = ({
  onExportJpg,
  onExportSvg,
  onStartRecord,
  onStopRecord,
  onImportJson,
  onExportJson,
}) => {
  const [recordingState] = useAtom(recordingStateAtom);

  return (
    <div className="space-y-3 bg-gray-50/70 p-3.5 rounded-md border border-gray-200">
      <div className="font-bold text-gray-900 flex items-center gap-2 text-xs">
        <FileCodeIcon className="w-4 h-4 text-gray-700" /> 出力 &amp; 保存
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onExportJpg}
          title="縦横2880pxの高解像度JPG画像とJSON設定を出力します"
          className="bg-gray-900 hover:bg-gray-800 text-white py-2 rounded font-medium transition flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-sm"
        >
          <FileImageIcon className="w-4 h-4" /> 高解像度JPG
        </button>
        <button
          type="button"
          onClick={onExportSvg}
          title="p5.js-svg を使用してベクターSVG画像を出力します"
          className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-2 rounded font-medium transition flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-sm"
        >
          <FileTypeIcon className="w-4 h-4" /> SVG
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={recordingState.isRecording}
          onClick={onStartRecord}
          title="mp4-muxer / WebCodecs で動画録画を開始します (Rキー)"
          className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-2 rounded font-medium transition flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <VideoIcon className="w-4 h-4" /> 録画開始 (MP4)
        </button>
        <button
          type="button"
          disabled={!recordingState.isRecording}
          onClick={onStopRecord}
          title="録画を停止して動画とJSONを出力します (Sキー)"
          className="bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-800 border border-gray-300 py-2 rounded font-medium transition flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:cursor-not-allowed shadow-sm"
        >
          <VideoIcon className="w-4 h-4" /> 録画停止
        </button>
      </div>

      {/* JSON File Export / Import */}
      <div className="pt-2 border-t border-gray-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-semibold text-xs">
            JSON設定ファイル
          </span>
          <button
            type="button"
            onClick={onExportJson}
            title="現在のパラメータとランダム化対象設定をJSONファイルとして保存します"
            className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded text-xs font-medium transition flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <FileDownIcon className="w-3.5 h-3.5" /> JSON保存
          </button>
        </div>

        <div title="過去に保存したJSONファイルを読み込んでパラメータやランダム設定を再現します">
          <input
            type="file"
            id="file-json-input"
            accept=".json"
            onChange={onImportJson}
            className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-gray-300 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
