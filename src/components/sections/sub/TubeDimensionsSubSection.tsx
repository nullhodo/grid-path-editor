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
}

export const TubeDimensionsSubSection: React.FC<Props> = ({
  params,
  onParamChange,
}) => {
  return (
    <div className="space-y-2 pt-2 border-t border-gray-200">
      <div title="描画されるヘビの太さを設定します（セル寸法に対する比率）">
        <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
          <label htmlFor="slider-tube-width">ヘビの太さ</label>
          <span className="text-gray-900">{params.tubeWidthRatio}</span>
        </div>
        <input
          type="range"
          id="slider-tube-width"
          min="0.2"
          max="0.95"
          step="0.01"
          value={params.tubeWidthRatio}
          className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange(
              "tubeWidthRatio",
              Number.parseFloat(e.target.value),
            )
          }
        />
      </div>

      <div title="ヘビの外郭線の太さを設定します（外幅に対する比率）">
        <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
          <label htmlFor="slider-tube-inner">外郭線太さ</label>
          <span className="text-gray-900">{params.tubeInnerRatio}</span>
        </div>
        <input
          type="range"
          id="slider-tube-inner"
          min="0.3"
          max="0.95"
          step="0.01"
          value={params.tubeInnerRatio}
          className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange(
              "tubeInnerRatio",
              Number.parseFloat(e.target.value),
            )
          }
        />
      </div>

      <div title="ヘビの中心軸を表す芯の太さをpx単位で設定します">
        <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
          <label htmlFor="slider-core-line-width">芯の太さ</label>
          <span className="text-gray-900">{params.coreLineWidth}</span>
        </div>
        <input
          type="range"
          id="slider-core-line-width"
          min="1"
          max="20"
          step="1"
          value={params.coreLineWidth}
          className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("coreLineWidth", Number.parseInt(e.target.value))
          }
        />
      </div>

      <div title="グリッドの中心点（ノード）に描画される丸ドットの直径を設定します（0で非表示）">
        <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
          <label htmlFor="slider-dot-size">セル中心ドットサイズ</label>
          <span className="text-gray-900">{params.dotSize}</span>
        </div>
        <input
          type="range"
          id="slider-dot-size"
          min="0"
          max="15"
          step="1"
          value={params.dotSize}
          className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("dotSize", Number.parseInt(e.target.value))
          }
        />
      </div>
    </div>
  );
};
