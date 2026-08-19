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

export const PaperTextureSubSection: React.FC<Props> = ({
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
        title="和紙の温かみのある凹凸繊維感（Paper Bump & Fiber）を追加します"
      >
        <span className="text-gray-700 text-xs font-medium">
          開発途中：和紙の質感
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.showPaperTexture || false}
            className="sr-only peer"
            onChange={(e) =>
              onParamChange("showPaperTexture", e.target.checked)
            }
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      {params.showPaperTexture && (
        <div className="space-y-2 pt-1">
          <div title="紙の表面の凹凸・繊維感の強さを設定します">
            <div className="flex justify-between text-gray-900 font-medium text-[10px] mb-1">
              <label htmlFor="slider-paper-roughness">
                凹凸・繊維感 (Roughness)
              </label>
              <span className="text-gray-900">
                {Math.round((params.paperRoughness || 0.35) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-paper-roughness"
              min="0.05"
              max="0.8"
              step="0.05"
              value={params.paperRoughness || 0.35}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "paperRoughness",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>

          <div title="和紙の地色・紙質の暗みブレンド濃度を設定します">
            <div className="flex justify-between text-gray-900 font-medium text-[10px] mb-1">
              <label htmlFor="slider-paper-density">紙質陰影の濃度</label>
              <span className="text-gray-900">
                {Math.round((params.paperColorDensity || 0.2) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-paper-density"
              min="0.05"
              max="0.6"
              step="0.05"
              value={params.paperColorDensity || 0.2}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "paperColorDensity",
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
