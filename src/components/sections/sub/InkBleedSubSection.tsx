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

export const InkBleedSubSection: React.FC<Props> = ({
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
        title="紙の繊維にインクが浸透・染み出したようなアナログ表現を追加します"
      >
        <span className="text-gray-700 text-xs font-medium">
          開発途中：インク染み・滲み (Ink Bleed)
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.showInkBleed || false}
            className="sr-only peer"
            onChange={(e) =>
              onParamChange("showInkBleed", e.target.checked)
            }
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      {params.showInkBleed && (
        <div className="space-y-2 pt-1">
          <div title="インクの滲み・輪郭の拡大幅を設定します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
              <label htmlFor="slider-ink-bleed-amount">
                滲み量 (Bleed Amount)
              </label>
              <span className="text-gray-900">
                {params.inkBleedAmount || 4}px
              </span>
            </div>
            <input
              type="range"
              id="slider-ink-bleed-amount"
              min="1"
              max="15"
              step="1"
              value={params.inkBleedAmount || 4}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "inkBleedAmount",
                  Number.parseInt(e.target.value),
                )
              }
            />
          </div>

          <div title="インク浸透のゆらぎ・荒さを設定します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
              <label htmlFor="slider-ink-bleed-roughness">
                浸透ゆらぎ・荒さ
              </label>
              <span className="text-gray-900">
                {Math.round((params.inkBleedRoughness || 0.4) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-ink-bleed-roughness"
              min="0.1"
              max="1.0"
              step="0.05"
              value={params.inkBleedRoughness || 0.4}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "inkBleedRoughness",
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
