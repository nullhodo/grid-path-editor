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

export const DitheringSubSection: React.FC<Props> = ({
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
        title="レトロゲーム風のディザリング（Bayer Matrix）減色表現を適用します"
      >
        <span className="text-gray-700 text-xs font-medium">
          ディザリング (Bayer Matrix)
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.showDithering || false}
            className="sr-only peer"
            onChange={(e) =>
              onParamChange("showDithering", e.target.checked)
            }
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      {params.showDithering && (
        <div className="space-y-2 pt-1">
          <div title="ディザリング格子のドットスケール倍率を設定します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
              <label htmlFor="slider-dithering-scale">
                ドット解像度スケール
              </label>
              <span className="text-gray-900">
                {params.ditheringScale || 2}x
              </span>
            </div>
            <input
              type="range"
              id="slider-dithering-scale"
              min="1"
              max="8"
              step="1"
              value={params.ditheringScale || 2}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "ditheringScale",
                  Number.parseInt(e.target.value),
                )
              }
            />
          </div>

          <div title="ディザリング減色の階調ステップ数を設定します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
              <label htmlFor="slider-dithering-levels">
                階調数 (Levels)
              </label>
              <span className="text-gray-900">
                {params.ditheringLevels || 4} 階調
              </span>
            </div>
            <input
              type="range"
              id="slider-dithering-levels"
              min="2"
              max="16"
              step="1"
              value={params.ditheringLevels || 4}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "ditheringLevels",
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
