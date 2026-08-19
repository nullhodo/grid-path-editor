import { useAtom } from "jotai";
import { CheckIcon, GridIcon, XIcon } from "lucide-react";
import type React from "react";
import { PALETTES } from "../../constants/palettes";
import { sketchParamsAtom } from "../../state/sketchStore";
import type {
  BorderOptionKey,
  SketchParamValue,
  SketchParameters,
} from "../../types/sketch";

interface Props {
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
  onToggleBorderOption: (key: BorderOptionKey) => void;
}

export const GridLinesSection: React.FC<Props> = ({
  onParamChange,
  onToggleBorderOption,
}) => {
  const [params] = useAtom(sketchParamsAtom);
  const currentPalette = PALETTES[params.paletteIndex] || PALETTES[0];

  return (
    <div className="space-y-3 bg-gray-50/70 p-3.5 rounded-md border border-gray-200">
      <div className="font-bold text-gray-900 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <GridIcon className="w-4 h-4 text-gray-700" /> グリッド罫線表示
        </span>
        <label
          className="relative inline-flex items-center cursor-pointer select-none"
          title="グリッド罫線を描画するかの全体スイッチ"
        >
          <input
            type="checkbox"
            checked={params.showGridLines}
            className="sr-only peer"
            onChange={(e) =>
              onParamChange("showGridLines", e.target.checked)
            }
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div title="罫線の描画色を指定します（パレット色またはカラーピッカー）">
          <label
            className="text-gray-600 font-medium block text-[10px] mb-1"
            htmlFor="color-grid-line"
          >
            罫線の色
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              id="color-grid-line"
              value={params.gridLineColor}
              className="w-7 h-7 rounded border border-gray-300 bg-white cursor-pointer flex-shrink-0"
              onChange={(e) =>
                onParamChange("gridLineColor", e.target.value)
              }
            />
            <div className="flex gap-1 overflow-x-auto p-1 bg-white rounded border border-gray-200 flex-1">
              {currentPalette.colors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => onParamChange("gridLineColor", c.hex)}
                  className={`w-5 h-5 rounded border flex-shrink-0 transition-transform ${
                    params.gridLineColor.toLowerCase() ===
                    c.hex.toLowerCase()
                      ? "border-emerald-600 scale-110 shadow-sm ring-1 ring-emerald-500"
                      : "border-gray-300 hover:scale-105 opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={`パレット色: ${c.name} (${c.hex})`}
                />
              ))}
            </div>
          </div>
        </div>
        <div title="罫線の太さを設定します">
          <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
            <label htmlFor="slider-grid-line-width">罫線太さ</label>
            <span className="text-gray-900">{params.gridLineWidth}</span>
          </div>
          <input
            type="range"
            id="slider-grid-line-width"
            min="1"
            max="10"
            value={params.gridLineWidth}
            className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer mt-1"
            onChange={(e) =>
              onParamChange(
                "gridLineWidth",
                Number.parseInt(e.target.value),
              )
            }
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-200">
        <span className="text-gray-600 block text-[11px] font-medium mb-1">
          表示位置の個別トグル設定
        </span>

        {/* 行1: 外周枠線 */}
        <div className="grid grid-cols-1">
          <button
            type="button"
            onClick={() => onToggleBorderOption("showGridOuterBorder")}
            title="キャンバス外周の枠線を描画"
            className={`w-full px-2.5 py-1.5 rounded border text-[11px] flex items-center justify-between transition cursor-pointer ${
              params.showGridOuterBorder
                ? "bg-gray-100 text-gray-900 border-gray-400 font-medium shadow-inner ring-1 ring-gray-400/30"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>外周枠線</span>
            {params.showGridOuterBorder ? (
              <CheckIcon className="w-3 h-3 text-gray-800" />
            ) : (
              <XIcon className="w-3 h-3 text-gray-400" />
            )}
          </button>
        </div>

        {/* 行2: 内側線 (水平・垂直) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onToggleBorderOption("showGridInnerHorizontal")}
            title="内側の水平罫線を描画"
            className={`px-2.5 py-1.5 rounded border text-[11px] flex items-center justify-between transition cursor-pointer ${
              params.showGridInnerHorizontal
                ? "bg-gray-100 text-gray-900 border-gray-400 font-medium shadow-inner ring-1 ring-gray-400/30"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>内側水平線</span>
            {params.showGridInnerHorizontal ? (
              <CheckIcon className="w-3 h-3 text-gray-800" />
            ) : (
              <XIcon className="w-3 h-3 text-gray-400" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onToggleBorderOption("showGridInnerVertical")}
            title="内側の垂直罫線を描画"
            className={`px-2.5 py-1.5 rounded border text-[11px] flex items-center justify-between transition cursor-pointer ${
              params.showGridInnerVertical
                ? "bg-gray-100 text-gray-900 border-gray-400 font-medium shadow-inner ring-1 ring-gray-400/30"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>内側垂直線</span>
            {params.showGridInnerVertical ? (
              <CheckIcon className="w-3 h-3 text-gray-800" />
            ) : (
              <XIcon className="w-3 h-3 text-gray-400" />
            )}
          </button>
        </div>

        {/* 行3: ヘビの芯 (水平・垂直) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onToggleBorderOption("showGridCenterHorizontal")
            }
            title="ヘビの芯（0.5セルオフセット）を通る水平罫線を描画"
            className={`px-2.5 py-1.5 rounded border text-[11px] flex items-center justify-between transition cursor-pointer ${
              params.showGridCenterHorizontal
                ? "bg-gray-100 text-gray-900 border-gray-400 font-medium shadow-inner ring-1 ring-gray-400/30"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>芯を通る水平線</span>
            {params.showGridCenterHorizontal ? (
              <CheckIcon className="w-3 h-3 text-gray-800" />
            ) : (
              <XIcon className="w-3 h-3 text-gray-400" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onToggleBorderOption("showGridCenterVertical")}
            title="ヘビの芯（0.5セルオフセット）を通る垂直罫線を描画"
            className={`px-2.5 py-1.5 rounded border text-[11px] flex items-center justify-between transition cursor-pointer ${
              params.showGridCenterVertical
                ? "bg-gray-100 text-gray-900 border-gray-400 font-medium shadow-inner ring-1 ring-gray-400/30"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>芯を通る垂直線</span>
            {params.showGridCenterVertical ? (
              <CheckIcon className="w-3 h-3 text-gray-800" />
            ) : (
              <XIcon className="w-3 h-3 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
