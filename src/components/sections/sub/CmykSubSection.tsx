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

export const CmykSubSection: React.FC<Props> = ({
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
        title="4色（Cyan/Magenta/Yellow/Black）に分版し、独立した多方向の版ズレと乗算インク重ね刷り効果をシミュレートします"
      >
        <span className="text-gray-700 text-xs font-medium">
          開発途中：CMYK印刷 (4色版ズレ)
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.showCmyk || false}
            className="sr-only peer"
            onChange={(e) => onParamChange("showCmyk", e.target.checked)}
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      {params.showCmyk && (
        <div className="space-y-2 pt-1">
          <div title="CMYK各色版のズレ度合いを係数（画面サイズ比例）で調整します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
              <label htmlFor="slider-cmyk-offset">
                版ズレ係数 (Offset Factor)
              </label>
              <span className="text-gray-900">
                {Math.round(
                  (params.cmykOffsetFactor !== undefined
                    ? params.cmykOffsetFactor
                    : 0.35) * 100,
                )}
                %
              </span>
            </div>
            <input
              type="range"
              id="slider-cmyk-offset"
              min="0.0"
              max="1.0"
              step="0.05"
              value={
                params.cmykOffsetFactor !== undefined
                  ? params.cmykOffsetFactor
                  : 0.35
              }
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "cmykOffsetFactor",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>

          <div title="各色インクの着色濃度・重なり発色強度を設定します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
              <label htmlFor="slider-cmyk-intensity">インク濃度</label>
              <span className="text-gray-900">
                {Math.round(
                  (params.cmykIntensity !== undefined
                    ? params.cmykIntensity
                    : 0.9) * 100,
                )}
                %
              </span>
            </div>
            <input
              type="range"
              id="slider-cmyk-intensity"
              min="0.2"
              max="1.0"
              step="0.05"
              value={
                params.cmykIntensity !== undefined
                  ? params.cmykIntensity
                  : 0.9
              }
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "cmykIntensity",
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
