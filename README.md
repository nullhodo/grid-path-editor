# grid-path-editor

グリッド状にマウスでパスを描画・編集し、立体内部シャドウや多彩なエフェクトを適用して高解像度出力できるWebエディタ。

## 目次

1. [概要](#概要)
2. [仕組み](#仕組み)
   - [構造](#構造)
3. [実行方法](#実行方法)
4. [主な機能 & 操作方法](#主な機能--操作方法)

## 概要

`grid-path-editor` は、グリッド上のセルをマウス操作して直感的に自由なパス (線・チューブ形状) を作成・編集できるデザインツールです。
行数・列数、角丸率、色テーマ、外郭線太さ、芯の太さなどのパラメータのカスタマイズに加え、内部シャドウや7種のエフェクト (フィルムグレイン、CMYK印刷、リソグラフ風印刷、網点ハーフトーン、カラーディザリング、インク染み・滲み、和紙の質感) を適用してリッチなグラフィック表現を創出できます。

## 仕組み

- 言語: TypeScript
- ライブラリ: React 18, p5.js, mp4-muxer, Jotai, Lucide React, Framer Motion, p5.js-svg
- ビルド: Vite
- パッケージマネージャー: pnpm
- リンター / フォーマッター: Biome
- クリーナップ検証: Knip

### 構造

```text
grid-path-editor
├── .github/
│   └── workflows/
│       └── deploy.yml
├── index.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
├── vite.config.ts
├── biome.json
├── tailwind.config.js
├── postcss.config.js
├── .npmrc
├── .gitignore
├── README.md
├── output/
└── src/
    ├── main.tsx                - メインエントリー & p5.js ループ統合 & マウス操作
    ├── index.css
    ├── vite-env.d.ts
    ├── types/
    │   └── sketch.ts           - スケッチパラメータ、セル・パス型定義
    ├── constants/
    │   └── palettes.ts         - プリセットカラーパレットデータ
    ├── state/
    │   └── sketchStore.ts      - Jotaiによる状態管理と履歴スタック (パラメータ & パス)
    ├── hooks/
    │   ├── useSketchHandlers.ts    - 手動描画・消去・パラメータ操作・履歴管理フック
    │   └── useKeyboardShortcuts.ts - ショートカットキー操作統合
    ├── utils/
    │   ├── noiseUtils.ts       - 静止テクスチャ用決定論的 PRNG 擬似乱数
    │   └── date.ts             - 出力ファイル名用フォーマット関数
    ├── core/
    │   ├── pathEditor.ts       - 手動パス描画・消去・マンハッタン補間・パス操作コア
    │   ├── recorder.ts         - mp4-muxerを使用したWebCodecs MP4動画録画
    │   ├── exporter.ts         - 高解像度JPG、SVGベクター、JSON設定出力・入力パース
    │   ├── renderer.ts         - 各レンダラー公開関数のファサードモジュール
    │   └── renderers/          - 機能別モジュール化描画システム
    │       ├── editorOverlay.ts    - ホバーセル枠 & ツールカーソル描画
    │       ├── tubeShape.ts        - ヘビ状パスおよび角丸ベジェ曲線描画
    │       ├── tubeCaps.ts         - パス端点キャップ描画
    │       ├── gridLines.ts        - 背景グリッド罫線描画
    │       ├── layoutHelper.ts     - キャンバス領域・セル寸法計算ヘルパー
    │       ├── relief3dRenderer.ts - 内部シャドウ (外郭線 > 芯 > 罫線の仮想高さ・内部陰影)
    │       ├── cmykRenderer.ts     - CMYK 4色版ズレ印刷エフェクト
    │       ├── risoRenderer.ts     - リソグラフ風印刷 (色版分けオフセット)
    │       ├── halftoneRenderer.ts - 角度付き回転網点ドットスクリーン
    │       ├── ditheringRenderer.ts - 8x8 Bayer Matrix カラーディザリング
    │       ├── inkBleedRenderer.ts - 毛細管浸透インク染み・滲み
    │       ├── paperTextureRenderer.ts - 凹凸紙・和紙の質感 & バンプ
    │       ├── grainOverlay.ts     - フィルムグレインノイズ
    │       └── debugOverlay.ts     - デバッグ情報オーバーレイ
    └── components/
        ├── EditorToolbar.tsx   - 画面上部フローティング統合編集ツールバー
        ├── ControlPanel.tsx    - アニメーション付き左側設定サイドバー
        ├── RecordingOverlay.tsx - 録画中ステータスHUDオーバーレイ
        ├── overlays/
        │   └── LightAngleOverlay.tsx - 光源角度調整HUDコンパス
        └── sections/           - 設定カテゴリごとの個別UIコンポーネント
            ├── ColorPaletteSection.tsx - 配色パレット & グラデーション生成
            ├── GridLayoutSection.tsx   - グリッド行列数 & 余白・比率
            ├── GridLinesSection.tsx    - 罫線表示 & 構成設定
            ├── RenderingStyleSection.tsx - 描画スタイル & 内部シャドウ / エフェクト
            ├── ExportSection.tsx       - 出力 (高解像度JPG / SVG / MP4録画 / JSON保存・読込)
            └── sub/            - サブ設定UIアコーディオン
                ├── RoundnessSubSection.tsx       - 角丸率設定
                ├── TubeDimensionsSubSection.tsx  - チューブ寸法 (外郭線/芯/ドットサイズ) 設定
                ├── ArtisticEffectsSubSection.tsx - テクスチャエフェクト設定コンテナ
                ├── GrainSubSection.tsx           - フィルムグレイン設定
                ├── Shadow3dSubSection.tsx        - 内部シャドウ (3D Relief) 設定
                ├── CmykSubSection.tsx            - CMYK版ズレ印刷設定
                ├── RisoSubSection.tsx            - リソグラフ風印刷設定
                ├── HalftoneSubSection.tsx        - 網点ハーフトーン設定
                ├── DitheringSubSection.tsx       - カラーディザリング設定
                ├── InkBleedSubSection.tsx        - インク染み・滲み設定
                └── PaperTextureSubSection.tsx    - 凹凸紙・和紙の質感設定
```

## 実行方法

| コマンド       | 実行内容                                  |
| -------------- | ----------------------------------------- |
| `pnpm install` | パッケージのインストール                  |
| `pnpm dev`     | 開発サーバーの起動                        |
| `pnpm build`   | 生産用ビルドの実行                        |
| `pnpm preview` | ビルド成果物のプレビュー                  |
| `pnpm check`   | Biomeによるリンター・フォーマットチェック |
| `pnpm format`  | Biomeによる自動コードフォーマット         |
| `pnpm knip`    | 未使用ファイル・デッドコードの検出        |

## 主な機能 & 操作方法

- **直感的なマウス直接操作**:
  - **左クリック長押し / ドラッグ**: **描画**。セルをクリック・ドラッグして連続したヘビ状パスを自由に描画・延長。素早いドラッグ時も直交マンハッタン補間で滑らかに接続。
  - **右クリック長押し / ドラッグ**: **消去**。セルをクリック・ドラッグしてパスを消去・切断。
  - **全消去 (Clear)** (`C` キー): キャンバス上のすべてのパスをワンクリックで消去。
  - **パス反転 (Reverse)**: パスの向き (始点・終点) を反転。
- **統合エディタツールバー**: 画面上部にフローティング配置され、マウス操作ガイド、パス全消去、反転、Undo/Redo、パス本数・使用セル数を集約表示。
- **設定パネル開閉** (`H` キー): `H` キーまたは画面左上のボタンでツール設定ウィンドウの表示/非表示を切り替え。
- **完全な履歴管理 (Undo / Redo)**: パラメータ変更や手動描画・消去したパスを含めて `Ctrl+Z` / `Ctrl+Y` (または `Ctrl+Shift+Z`) で巻き戻し・やり直しが可能。
- **内部シャドウ (3D Relief)**: 外郭線 > 芯 > 罫線の仮想高さに基づき、図形外部ではなく図形内部に発生するリッチな陰影・ベベル・光沢ハイライトをリアルタイムレンダリング。
- **光源角度HUDコンパス**: 内部シャドウの光源角度スライダー操作時に、画面中央へ照射角度と太陽位置をアニメーション表示。
- **7種の静止アーティスティック・エフェクト**: フィルムグレイン、CMYK印刷、リソグラフ風印刷、網点ハーフトーン、カラーディザリング、インク染み・滲み、和紙の質感を適用可能。
- **高解像度出力 & JSON設定保存・読込**:
  - **高解像度JPG**: パスデータを含む 2880x2880px JPG画像を出力。
  - **SVGベクター**: `p5.js-svg` を利用したベクターSVG画像を出力。
  - **MP4録画**: mp4-muxer / WebCodecs で動画録画・保存。
  - **JSON保存 & 復元**: 再現用 JSON 設定ファイルを保存、または過去の JSON をアップロードしてパラメータとパスを完全再現。
