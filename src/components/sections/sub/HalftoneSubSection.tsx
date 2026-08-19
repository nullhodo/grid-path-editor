import type React from "react";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../../types/sketch";

interface Props {
  params: SketchParameters;
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
  hideBorderTop?: boolean;
}

export const HalftoneSubSection: React.FC<Props> = ({
  params,
  onParamChange,
  hideBorderTop,
}) => {
  return (
    <div
      className={`${
        hideBorderTop ? "" : "pt-2 border-t border-gray-200"
      } space-y-2`}
    >
      <div
        className="flex items-center justify-between"
        title="レトロ漫画・ポスター風のハーフトーン（網点ドットスクリーン）効果を適用します"
      >
        <span className="text-gray-700 text-xs font-medium">
          ハーフトーン (網点ドット)
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.showHalftone || false}
            className="sr-only peer"
            onChange={(e) =>
              onParamChange("showHalftone", e.target.checked)
            }
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      {params.showHalftone && (
        <div className="space-y-2 pt-1">
          <div title="網点ドットの大きさを設定します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
              <label htmlFor="slider-halftone-size">
                網点ドットサイズ
              </label>
              <span className="text-gray-900">
                {params.halftoneSize || 6}px
              </span>
            </div>
            <input
              type="range"
              id="slider-halftone-size"
              min="2"
              max="20"
              step="1"
              value={params.halftoneSize || 6}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "halftoneSize",
                  Number.parseInt(e.target.value),
                )
              }
            />
          </div>

          <div title="網点格子の回転角度を設定します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
              <label htmlFor="slider-halftone-angle">
                スクリーンの角度
              </label>
              <span className="text-gray-900">
                {params.halftoneAngle || 45}°
              </span>
            </div>
            <input
              type="range"
              id="slider-halftone-angle"
              min="0"
              max="90"
              step="5"
              value={params.halftoneAngle || 45}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "halftoneAngle",
                  Number.parseInt(e.target.value),
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
