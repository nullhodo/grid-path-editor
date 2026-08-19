import { useAtom } from "jotai";
import type React from "react";
import { useEffect, useRef } from "react";
import { isAdjustingLightAngleAtom } from "../../../state/sketchStore";
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

export const Shadow3dSubSection: React.FC<Props> = ({
  params,
  onParamChange,
  hideBorderTop,
}) => {
  const [, setIsAdjustingLightAngle] = useAtom(isAdjustingLightAngleAtom);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsAdjustingLightAngle(false);
      }
    };

    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("touchend", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("touchend", handleGlobalPointerUp);
    };
  }, [setIsAdjustingLightAngle]);
  return (
    <div
      className={`${
        hideBorderTop ? "" : "pt-2 border-t border-gray-200"
      } space-y-2.5`}
    >
      <div
        className="flex items-center justify-between"
        title="外郭線・芯・罫線それぞれの内部に立体陰影・ハイライト・丸みを適用します"
      >
        <span className="text-gray-700 text-xs font-medium">シャドウ</span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.show3dShadow || false}
            className="sr-only peer"
            onChange={(e) =>
              onParamChange("show3dShadow", e.target.checked)
            }
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      {params.show3dShadow && (
        <div className="space-y-2.5 pt-1 bg-gray-50/70 p-2 rounded border border-gray-200">
          {/* 高さ */}
          <div
            className="space-y-1"
            title="立体の高さ・盛り上がり度合いを調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-3d-depth">高さ</label>
              <span className="text-gray-900">
                {Math.round((params.shadowDepth3d ?? 0.6) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-3d-depth"
              min="0.1"
              max="1.0"
              step="0.05"
              value={params.shadowDepth3d ?? 0.6}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "shadowDepth3d",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>

          {/* 光源角度 */}
          <div
            className="space-y-1"
            title="光が差し込む角度（0°〜360°）を調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-3d-light-angle">光源角度</label>
              <span className="text-gray-900">
                {params.lightAngle3d ?? 315}°
              </span>
            </div>
            <input
              type="range"
              id="slider-3d-light-angle"
              min="0"
              max="360"
              step="5"
              value={params.lightAngle3d ?? 315}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onPointerDown={() => {
                isDraggingRef.current = true;
                setIsAdjustingLightAngle(true);
              }}
              onTouchStart={() => {
                isDraggingRef.current = true;
                setIsAdjustingLightAngle(true);
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "ArrowLeft" ||
                  e.key === "ArrowRight" ||
                  e.key === "ArrowUp" ||
                  e.key === "ArrowDown"
                ) {
                  setIsAdjustingLightAngle(true);
                }
              }}
              onKeyUp={() => {
                setTimeout(() => setIsAdjustingLightAngle(false), 500);
              }}
              onBlur={() => {
                isDraggingRef.current = false;
                setIsAdjustingLightAngle(false);
              }}
              onChange={(e) =>
                onParamChange(
                  "lightAngle3d",
                  Number.parseInt(e.target.value, 10),
                )
              }
            />
          </div>

          {/* シャドウ強度 */}
          <div
            className="space-y-1"
            title="図形内部に落ちる陰影の濃さを調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-3d-shadow-intensity">
                シャドウ強度
              </label>
              <span className="text-gray-900">
                {Math.round((params.shadowIntensity3d ?? 0.65) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-3d-shadow-intensity"
              min="0.0"
              max="1.0"
              step="0.05"
              value={params.shadowIntensity3d ?? 0.65}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "shadowIntensity3d",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>

          {/* ハイライト強度 */}
          <div
            className="space-y-1"
            title="尾根部分の光沢・ハイライトの強さを調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-3d-highlight-intensity">
                ハイライト強度
              </label>
              <span className="text-gray-900">
                {Math.round((params.highlightIntensity3d ?? 0.5) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-3d-highlight-intensity"
              min="0.0"
              max="1.0"
              step="0.05"
              value={params.highlightIntensity3d ?? 0.5}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "highlightIntensity3d",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>

          {/* 丸み */}
          <div
            className="space-y-1"
            title="エッジの丸み・ベベルのスムーズさを調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-3d-bevel-smoothness">丸み</label>
              <span className="text-gray-900">
                {Math.round((params.bevelSmoothness3d ?? 0.5) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-3d-bevel-smoothness"
              min="0.1"
              max="1.0"
              step="0.05"
              value={params.bevelSmoothness3d ?? 0.5}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "bevelSmoothness3d",
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
