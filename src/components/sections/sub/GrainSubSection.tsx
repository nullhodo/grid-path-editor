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

export const GrainSubSection: React.FC<Props> = ({
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
        title="グラフィックにフィルムグレイン（紙・粒子・砂目のざらついた質感）を追加します"
      >
        <span className="text-gray-700 text-xs font-medium">
          フィルムグレイン (ざらつき質感)
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.showGrain || false}
            className="sr-only peer"
            onChange={(e) => onParamChange("showGrain", e.target.checked)}
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      {params.showGrain && (
        <div className="space-y-1 pt-1" title="ざらつきの強さを調整します">
          <div className="flex justify-between text-gray-600 font-medium text-[10px]">
            <label htmlFor="slider-grain-intensity">グレイン強度</label>
            <span className="text-gray-900">
              {Math.round((params.grainIntensity || 0.15) * 100)}%
            </span>
          </div>
          <input
            type="range"
            id="slider-grain-intensity"
            min="0.05"
            max="0.45"
            step="0.01"
            value={params.grainIntensity || 0.15}
            className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
            onChange={(e) =>
              onParamChange(
                "grainIntensity",
                Number.parseFloat(e.target.value),
              )
            }
          />
        </div>
      )}
    </div>
  );
};
