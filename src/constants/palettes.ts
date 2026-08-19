import type { Palette, SketchParameters } from "../types/sketch";

export const PALETTES: Palette[] = [
  {
    title: "Retro Sunny Living",
    comment: "レトロで温かみのある暖色",
    colors: [
      { name: "RUBY", hex: "#A6171C", rgb: [166, 23, 28] },
      { name: "NATURAL", hex: "#D6D0C5", rgb: [214, 208, 197] },
      { name: "SUNNY", hex: "#F1C045", rgb: [241, 192, 69] },
    ],
  },
  {
    title: "Citrus Breeze",
    comment: "爽やかな青と柑橘系の黄色",
    colors: [
      { name: "LIGHT BLUE", hex: "#C3E7F1", rgb: [195, 231, 241] },
      { name: "MOONSTONE", hex: "#519CAB", rgb: [81, 156, 171] },
      { name: "SAFFRON", hex: "#FFC64F", rgb: [255, 198, 79] },
      { name: "GUNMETAL", hex: "#20373B", rgb: [32, 55, 59] },
    ],
  },
  {
    title: "Dreamy Sunset",
    comment: "淡いパステルカラーのグラデーション",
    colors: [
      { name: "Peach", hex: "#FAD6A5", rgb: [250, 214, 165] },
      { name: "Pink", hex: "#F593C4", rgb: [245, 147, 196] },
      { name: "Lavender", hex: "#B8AEE3", rgb: [184, 174, 227] },
      { name: "Sky Blue", hex: "#77CAE3", rgb: [119, 202, 227] },
      { name: "Dark Blue", hex: "#11476C", rgb: [17, 71, 108] },
    ],
  },
  {
    title: "Bold Modernism",
    comment: "モダンなビビッドピンクと無彩色",
    colors: [
      { name: "Magenta", hex: "#FF4777", rgb: [255, 71, 119] },
      { name: "Slate", hex: "#36434A", rgb: [54, 67, 74] },
      { name: "Camouflage Sand", hex: "#E5D4C8", rgb: [229, 212, 200] },
    ],
  },
  {
    title: "Classic Marine",
    comment: "クラシックなトリコロール",
    colors: [
      { name: "Deep Red", hex: "#7C170D", rgb: [124, 23, 13] },
      { name: "Navy Blue", hex: "#141A45", rgb: [20, 26, 69] },
      { name: "Off White", hex: "#ECE1D5", rgb: [236, 225, 213] },
    ],
  },
  {
    title: "Bauhaus Geometry",
    comment: "幾何学的な原色構成",
    colors: [
      { name: "Blue", hex: "#1E459F", rgb: [30, 69, 159] },
      { name: "Red", hex: "#CF2A2A", rgb: [207, 42, 42] },
      { name: "Yellow", hex: "#FABD32", rgb: [250, 189, 50] },
      { name: "Beige", hex: "#E1DCCA", rgb: [225, 220, 202] },
    ],
  },
  {
    title: "Dynamic Sport",
    comment: "アクティブでスポーティーなマルチカラー",
    colors: [
      { name: "BLUE", hex: "#2267B1", rgb: [34, 103, 177] },
      { name: "GOLD", hex: "#F7D232", rgb: [247, 210, 50] },
      { name: "ORANGE", hex: "#F36F36", rgb: [243, 111, 54] },
      { name: "GREEN", hex: "#5DC3AB", rgb: [93, 195, 171] },
    ],
  },
  {
    title: "Fruit Salad",
    comment: "鮮やかな青と黄色のコントラスト",
    colors: [
      { name: "Periwinkle", hex: "#9EB6F8", rgb: [158, 182, 248] },
      { name: "Royal Blue", hex: "#386CD4", rgb: [38, 108, 212] },
      { name: "Midnight", hex: "#292E4F", rgb: [41, 46, 79] },
      { name: "Mustard", hex: "#E2AD3E", rgb: [226, 173, 62] },
      { name: "Lemon", hex: "#F3D959", rgb: [243, 217, 89] },
    ],
  },
  {
    title: "Cabbage Violet",
    comment: "紫の静かなグラデーション",
    colors: [
      { name: "Color 01", hex: "#BDDEDD", rgb: [189, 222, 221] },
      { name: "Color 02", hex: "#8BB9C1", rgb: [139, 185, 193] },
      { name: "Color 03", hex: "#7F5388", rgb: [127, 83, 136] },
      { name: "Color 04", hex: "#564A70", rgb: [86, 74, 112] },
      { name: "Color 05", hex: "#34283F", rgb: [52, 40, 63] },
    ],
  },
  {
    title: "Pink Salt Lake",
    comment: "ピンクの塩湖と水色のグラデーション",
    colors: [
      { name: "Veranda Blue", hex: "#6BB1AD", rgb: [107, 177, 173] },
      { name: "Sky Cloud", hex: "#A7BCBD", rgb: [167, 188, 189] },
      { name: "Lychee", hex: "#EDECDB", rgb: [237, 236, 219] },
      { name: "Melon", hex: "#E5A9A9", rgb: [229, 169, 169] },
      { name: "Cupid Pink", hex: "#E6748E", rgb: [230, 116, 142] },
    ],
  },
  {
    title: "Vintage Vinyl",
    comment: "レコードと落ち着いたスチールトーン",
    colors: [
      { name: "Bone", hex: "#D8D6C9", rgb: [216, 214, 201] },
      { name: "Pearl Beige", hex: "#E6D9B9", rgb: [230, 217, 185] },
      { name: "Cool Steel", hex: "#749190", rgb: [116, 145, 144] },
      { name: "Dark Slate Grey", hex: "#465F64", rgb: [70, 95, 100] },
      { name: "Jet Black", hex: "#263339", rgb: [38, 51, 57] },
    ],
  },
];

export const DEFAULT_SKETCH_PARAMETERS: SketchParameters = {
  gridRows: 6,
  gridColumns: 6,
  gridPadding: 0.15,
  canvasAspectRatio: 1.0,
  paletteIndex: 0,
  backgroundColor: "#A6171C",
  outlineColor: "#D6D0C5",
  coreColor: "#F1C045",
  dotColor: "#e6e6e6",
  cornerRoundnessPercent: 100,
  tipRoundnessPercent: 100,
  syncRoundness: true,
  showGridLines: true,
  gridLineColor: "#D6D0C5",
  gridLineWidth: 2,
  showGridOuterBorder: true,
  showGridInnerHorizontal: true,
  showGridInnerVertical: true,
  showGridCenterHorizontal: false,
  showGridCenterVertical: false,
  tubeWidthRatio: 0.65,
  tubeInnerRatio: 0.82,
  coreLineWidth: 6,
  dotSize: 5,
  autoHideDotsWhenRounded: true,
  debugMode: false,
  showGrain: false,
  grainIntensity: 0.15,

  // 3D Relief & Internal Shadow
  show3dShadow: false,
  shadowDepth3d: 0.6,
  lightAngle3d: 315,
  shadowIntensity3d: 0.65,
  highlightIntensity3d: 0.5,
  bevelSmoothness3d: 0.5,

  // Texture & Print Effects
  showRiso: false,
  risoOffsetPx: 3,
  risoIntensity: 0.25,

  showHalftone: false,
  halftoneSize: 6,
  halftoneAngle: 45,

  showDithering: false,
  ditheringScale: 2,
  ditheringLevels: 4,

  showInkBleed: false,
  inkBleedAmount: 4,
  inkBleedRoughness: 0.4,

  showPaperTexture: false,
  paperRoughness: 0.35,
  paperColorDensity: 0.2,

  showCmyk: false,
  cmykOffsetFactor: 0.35,
  cmykIntensity: 0.9,
};
