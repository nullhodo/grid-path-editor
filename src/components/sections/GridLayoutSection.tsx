import { useAtom } from "jotai";
import { TableIcon } from "lucide-react";
import type React from "react";
import { sketchParamsAtom } from "../../state/sketchStore";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../types/sketch";

interface Props {
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
}

export const GridLayoutSection: React.FC<Props> = ({ onParamChange }) => {
  const [params] = useAtom(sketchParamsAtom);

  return (
    <div className="space-y-3 bg-gray-50/70 p-3.5 rounded-md border border-gray-200">
      <div className="font-bold text-gray-900 flex items-center gap-2 text-xs">
        <TableIcon className="w-4 h-4 text-gray-700" /> グリッド &amp;
        レイアウト
      </div>

      <div className="space-y-1" title="グリッドの行数を変更します">
        <div className="flex justify-between text-gray-600 font-medium">
          <label htmlFor="slider-rows">行数 (Rows)</label>
          <span className="text-gray-900">{params.gridRows}</span>
        </div>
        <input
          type="range"
          id="slider-rows"
          min="2"
          max="24"
          value={params.gridRows}
          className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("gridRows", Number.parseInt(e.target.value))
          }
        />
      </div>

      <div className="space-y-1" title="グリッドの列数を変更します">
        <div className="flex justify-between text-gray-600 font-medium">
          <label htmlFor="slider-columns">列数 (Columns)</label>
          <span className="text-gray-900">{params.gridColumns}</span>
        </div>
        <input
          type="range"
          id="slider-columns"
          min="2"
          max="24"
          value={params.gridColumns}
          className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("gridColumns", Number.parseInt(e.target.value))
          }
        />
      </div>

      <div
        className="space-y-1"
        title="外周のマージン(パディング)割合を調節します"
      >
        <div className="flex justify-between text-gray-600 font-medium">
          <label htmlFor="slider-padding">キャンバスマージン</label>
          <span className="text-gray-900">
            {params.gridPadding.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          id="slider-padding"
          min="0.05"
          max="0.3"
          step="0.01"
          value={params.gridPadding}
          className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("gridPadding", Number.parseFloat(e.target.value))
          }
        />
      </div>

      <div
        className="space-y-1"
        title="キャンバス内部描画領域の上下・左右アスペクト比を調節します"
      >
        <div className="flex justify-between text-gray-600 font-medium">
          <label htmlFor="slider-aspect-ratio">アスペクト比</label>
          <span className="text-gray-900">
            {params.canvasAspectRatio.toFixed(2)}
            {params.canvasAspectRatio === 1.0 ? " (1:1)" : ""}
          </span>
        </div>
        <input
          type="range"
          id="slider-aspect-ratio"
          min="0.5"
          max="2.0"
          step="0.05"
          value={params.canvasAspectRatio}
          className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange(
              "canvasAspectRatio",
              Number.parseFloat(e.target.value),
            )
          }
        />
      </div>
    </div>
  );
};
