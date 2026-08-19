export interface GridCell {
  columnIndex: number;
  rowIndex: number;
}

export type PathChain = GridCell[];

export interface ColorItem {
  name: string;
  hex: string;
  rgb: [number, number, number];
}

export interface Palette {
  title: string;
  comment: string;
  colors: ColorItem[];
}

export type EditorTool = "draw" | "erase";

export interface SketchParameters {
  gridRows: number;
  gridColumns: number;
  gridPadding: number;
  canvasAspectRatio: number;
  paletteIndex: number;
  backgroundColor: string;
  outlineColor: string;
  coreColor: string;
  dotColor: string;
  cornerRoundnessPercent: number;
  tipRoundnessPercent: number;
  syncRoundness: boolean;
  showGridLines: boolean;
  gridLineColor: string;
  gridLineWidth: number;
  showGridOuterBorder: boolean;
  showGridInnerHorizontal: boolean;
  showGridInnerVertical: boolean;
  showGridCenterHorizontal: boolean;
  showGridCenterVertical: boolean;
  tubeWidthRatio: number;
  tubeInnerRatio: number;
  coreLineWidth: number;
  dotSize: number;
  autoHideDotsWhenRounded: boolean;
  debugMode: boolean;
  showGrain: boolean;
  grainIntensity: number;

  // 3D Relief & Internal Shadow
  show3dShadow: boolean;
  shadowDepth3d: number;
  lightAngle3d: number;
  shadowIntensity3d: number;
  highlightIntensity3d: number;
  bevelSmoothness3d: number;

  // Texture & Print Effects
  showRiso: boolean;
  risoOffsetPx: number;
  risoIntensity: number;

  showHalftone: boolean;
  halftoneSize: number;
  halftoneAngle: number;

  showDithering: boolean;
  ditheringScale: number;
  ditheringLevels: number;

  showInkBleed: boolean;
  inkBleedAmount: number;
  inkBleedRoughness: number;

  showPaperTexture: boolean;
  paperRoughness: number;
  paperColorDensity: number;

  showCmyk: boolean;
  cmykOffsetFactor: number;
  cmykIntensity: number;
}

export type SketchParamValue = number | boolean | string;

export type BorderOptionKey =
  | "showGridOuterBorder"
  | "showGridInnerHorizontal"
  | "showGridInnerVertical"
  | "showGridCenterHorizontal"
  | "showGridCenterVertical";
