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

export const RisoSubSection: React.FC<Props> = ({
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
        title="リソグラフ印刷特有の版ズレ（オフセット）と乗算インクカスレ効果を追加します"
      >
        <span className="text-gray-700 text-xs font-medium">
          開発途中：リソグラフ風
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.showRiso || false}
            className="sr-only peer"
            onChange={(e) => onParamChange("showRiso", e.target.checked)}
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      {params.showRiso && (
        <div className="space-y-2 pt-1">
          <div title="印刷時の色版のズレ（オフセット）量をピクセル単位で調整します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
              <label htmlFor="slider-riso-offset">
                版ズレ量 (Misregistration)
              </label>
              <span className="text-gray-900">
                {params.risoOffsetPx || 3}px
              </span>
            </div>
            <input
              type="range"
              id="slider-riso-offset"
              min="1"
              max="10"
              step="1"
              value={params.risoOffsetPx || 3}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "risoOffsetPx",
                  Number.parseInt(e.target.value),
                )
              }
            />
          </div>

          <div title="インクの微細なかすれノイズ濃度を調整します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
              <label htmlFor="slider-riso-intensity">
                インクカスレ濃度
              </label>
              <span className="text-gray-900">
                {Math.round((params.risoIntensity || 0.25) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-riso-intensity"
              min="0.05"
              max="0.8"
              step="0.05"
              value={params.risoIntensity || 0.25}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "risoIntensity",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
