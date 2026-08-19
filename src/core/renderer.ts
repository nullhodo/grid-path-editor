/**
 * Facade module: re-exports all public renderer functions from sub-modules.
 * Consumers can continue to import from "./core/renderer" without changes.
 */
export { renderPathsGraphics } from "./renderers/tubeShape";
export { renderDebugInformation } from "./renderers/debugOverlay";
