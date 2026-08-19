import { SparklesIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../../types/sketch";
import { CmykSubSection } from "./CmykSubSection";
import { DitheringSubSection } from "./DitheringSubSection";
import { GrainSubSection } from "./GrainSubSection";
import { HalftoneSubSection } from "./HalftoneSubSection";
import { InkBleedSubSection } from "./InkBleedSubSection";
import { PaperTextureSubSection } from "./PaperTextureSubSection";
import { RisoSubSection } from "./RisoSubSection";
import { Shadow3dSubSection } from "./Shadow3dSubSection";

interface Props {
  params: SketchParameters;
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
}

/**
 * Grouped SubSection for artistic texture & print effects:
 * Film Grain, 3D Relief / Inner Shadow, CMYK Print, Risograph, Halftone, Dithering, Ink Bleed, and Paper Texture.
 */
export const ArtisticEffectsSubSection: React.FC<Props> = ({
  params,
  onParamChange,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const activeEffectsCount = [
    params.showGrain,
    params.show3dShadow,
    params.showCmyk,
    params.showRiso,
    params.showHalftone,
    params.showDithering,
    params.showInkBleed,
    params.showPaperTexture,
  ].filter(Boolean).length;

  return (
    <div className="pt-2 border-t border-gray-200 space-y-2">
      <button
        type="button"
        className="w-full flex items-center justify-between cursor-pointer select-none py-1 group text-left bg-transparent border-0 p-0"
        onClick={() => setIsOpen(!isOpen)}
        title="フィルムグレインやCMYK印刷、和紙の質感などの静止テクスチャエフェクトを設定します"
      >
        <div className="flex items-center gap-1.5">
          <SparklesIcon className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-900 transition-colors" />
          <span className="text-gray-900 text-xs font-semibold group-hover:text-gray-700 transition-colors">
            アーティスティック・エフェクト
          </span>
          {activeEffectsCount > 0 && (
            <span className="bg-gray-100 text-gray-800 text-[10px] px-1.5 py-0.2 rounded-full font-medium border border-gray-300">
              {activeEffectsCount} ON
            </span>
          )}
        </div>
        <span className="text-gray-500 text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="space-y-3.5 p-2.5 bg-white rounded border border-gray-200">
          <GrainSubSection
            params={params}
            onParamChange={onParamChange}
            hideBorderTop={true}
          />
          <Shadow3dSubSection
            params={params}
            onParamChange={onParamChange}
          />
          <CmykSubSection params={params} onParamChange={onParamChange} />
          <RisoSubSection params={params} onParamChange={onParamChange} />
          <HalftoneSubSection
            params={params}
            onParamChange={onParamChange}
          />
          <DitheringSubSection
            params={params}
            onParamChange={onParamChange}
          />
          <InkBleedSubSection
            params={params}
            onParamChange={onParamChange}
          />
          <PaperTextureSubSection
            params={params}
            onParamChange={onParamChange}
          />
        </div>
      )}
    </div>
  );
};
