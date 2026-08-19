import { useAtom } from "jotai";
import { PaletteIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { PALETTES } from "../../constants/palettes";
import { sketchParamsAtom } from "../../state/sketchStore";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../types/sketch";

interface Props {
  onApplyPalette: (index: number) => void;
  onGenerateGradientTheme: (baseHex: string) => void;
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
}

export const ColorPaletteSection: React.FC<Props> = ({
  onApplyPalette,
  onGenerateGradientTheme,
  onParamChange,
}) => {
  const [params] = useAtom(sketchParamsAtom);
  const [baseColor, setBaseColor] = useState("#3b82f6");

  const currentPalette = PALETTES[params.paletteIndex] || PALETTES[0];

  return (
    <div className="space-y-3 bg-gray-50/70 p-3.5 rounded-md border border-gray-200">
      <div className="font-bold text-gray-900 flex items-center gap-2 text-xs">
        <PaletteIcon className="w-4 h-4 text-gray-700" /> カラーパレット
        &amp; テーマ
      </div>

      <div
        className="space-y-1"
        title="カラーパレットのテーマを選択します"
      >
        <label
          className="text-gray-600 font-medium block mb-1"
          htmlFor="select-palette"
        >
          プリセットパレット
        </label>
        <select
          id="select-palette"
          value={params.paletteIndex}
          onChange={(e) => onApplyPalette(Number.parseInt(e.target.value))}
          className="w-full bg-white border border-gray-300 text-gray-900 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
        >
          {PALETTES.map((pal, idx) => (
            <option key={pal.title} value={idx}>
              {pal.title} - {pal.comment}
            </option>
          ))}
        </select>
      </div>

      {/* Palette Colors Display */}
      <div className="space-y-1">
        <span className="text-gray-600 font-medium block text-[11px]">
          現在のパレット色:
        </span>
        <div className="flex gap-1.5 p-1.5 bg-gray-100/80 rounded border border-gray-200">
          {currentPalette.colors.map((c) => (
            <div
              key={c.hex}
              className="w-5 h-5 rounded border border-gray-300 flex-shrink-0 shadow-sm"
              style={{ backgroundColor: c.hex }}
              title={`${c.name} (${c.hex})`}
            />
          ))}
        </div>
      </div>

      {/* Gradient Theme Generator */}
      <div className="pt-2 border-t border-gray-200 space-y-2">
        <span className="text-gray-600 block font-medium">
          単色からグラデーションテーマを作成
        </span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer bg-white"
            title="ベース色を選択"
          />
          <button
            type="button"
            onClick={() => onGenerateGradientTheme(baseColor)}
            title="選択した色から複数のグラデーション色を生成します"
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-1.5 rounded text-xs transition font-medium shadow-sm cursor-pointer"
          >
            グラデーション生成
          </button>
        </div>
      </div>

      {/* Custom Pickers */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
        <div title="背景色を手動変更">
          <label
            className="text-gray-600 font-medium block text-[10px] mb-1"
            htmlFor="color-bg"
          >
            背景色
          </label>
          <input
            type="color"
            id="color-bg"
            value={params.backgroundColor}
            className="w-full h-7 rounded border border-gray-300 bg-white cursor-pointer"
            onChange={(e) =>
              onParamChange("backgroundColor", e.target.value)
            }
          />
        </div>
        <div title="外郭色">
          <label
            className="text-gray-600 font-medium block text-[10px] mb-1"
            htmlFor="color-outline"
          >
            外郭色
          </label>
          <input
            type="color"
            id="color-outline"
            value={params.outlineColor}
            className="w-full h-7 rounded border border-gray-300 bg-white cursor-pointer"
            onChange={(e) => onParamChange("outlineColor", e.target.value)}
          />
        </div>
        <div title="芯線(中心線)色">
          <label
            className="text-gray-600 font-medium block text-[10px] mb-1"
            htmlFor="color-core"
          >
            芯線色
          </label>
          <input
            type="color"
            id="color-core"
            value={params.coreColor}
            className="w-full h-7 rounded border border-gray-300 bg-white cursor-pointer"
            onChange={(e) => onParamChange("coreColor", e.target.value)}
          />
        </div>
        <div title="中心ドット色">
          <label
            className="text-gray-600 font-medium block text-[10px] mb-1"
            htmlFor="color-dot"
          >
            中心ドット色
          </label>
          <input
            type="color"
            id="color-dot"
            value={params.dotColor}
            className="w-full h-7 rounded border border-gray-300 bg-white cursor-pointer"
            onChange={(e) => onParamChange("dotColor", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
