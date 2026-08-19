import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { SunIcon } from "lucide-react";
import type React from "react";
import {
  isAdjustingLightAngleAtom,
  sketchParamsAtom,
} from "../../state/sketchStore";

export const LightAngleOverlay: React.FC = () => {
  const [isAdjusting] = useAtom(isAdjustingLightAngleAtom);
  const [params] = useAtom(sketchParamsAtom);

  const angleDeg = params.lightAngle3d ?? 315;
  const rad = (angleDeg * Math.PI) / 180;

  const compassRadius = 56;
  const sunX = Math.cos(rad) * compassRadius;
  const sunY = Math.sin(rad) * compassRadius;

  return (
    <AnimatePresence>
      {isAdjusting && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative flex flex-col items-center justify-center p-5 rounded-full bg-gray-950/80 backdrop-blur-md border border-white/20 shadow-2xl w-44 h-44 select-none"
          >
            {/* Compass Ring and Guide Ticks */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 176 176"
            >
              <title>光源角度コンパス</title>
              {/* Outer guide circle */}
              <circle
                cx="88"
                cy="88"
                r={compassRadius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* 4 Cardinal Tick Marks */}
              <line
                x1={88 + compassRadius - 4}
                y1="88"
                x2={88 + compassRadius + 4}
                y2="88"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              />
              <line
                x1="88"
                y1={88 + compassRadius - 4}
                x2="88"
                y2={88 + compassRadius + 4}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              />
              <line
                x1={88 - compassRadius - 4}
                y1="88"
                x2={88 - compassRadius + 4}
                y2="88"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              />
              <line
                x1="88"
                y1={88 - compassRadius - 4}
                x2="88"
                y2={88 - compassRadius + 4}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              />

              {/* Directional Light Ray from Sun to Center */}
              <defs>
                <linearGradient
                  id="rayGradient"
                  x1={88 + sunX}
                  y1={88 + sunY}
                  x2="88"
                  y2="88"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop
                    offset="0%"
                    stopColor="#F59E0B"
                    stopOpacity="0.9"
                  />
                  <stop
                    offset="100%"
                    stopColor="#F59E0B"
                    stopOpacity="0.1"
                  />
                </linearGradient>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" />
                </marker>
              </defs>

              {/* Main Arrow Line pointing towards center */}
              <line
                x1={88 + sunX * 0.75}
                y1={88 + sunY * 0.75}
                x2={
                  88 +
                  (sunX !== 0 || sunY !== 0
                    ? (sunX / compassRadius) * 16
                    : 0)
                }
                y2={
                  88 +
                  (sunX !== 0 || sunY !== 0
                    ? (sunY / compassRadius) * 16
                    : 0)
                }
                stroke="url(#rayGradient)"
                strokeWidth="2.5"
                markerEnd="url(#arrowhead)"
              />
            </svg>

            {/* Sun Icon positioned at the light angle position */}
            <div
              className="absolute w-7 h-7 rounded-full bg-amber-500/90 text-white flex items-center justify-center shadow-lg border border-amber-300 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
              style={{
                left: `${88 + sunX}px`,
                top: `${88 + sunY}px`,
              }}
            >
              <SunIcon className="w-4 h-4 text-amber-100 animate-pulse" />
            </div>

            {/* Center Angle Display */}
            <div className="z-10 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                光源角度
              </span>
              <span className="text-xl font-bold text-white tracking-tight">
                {angleDeg}°
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
