import { atom } from "jotai";
import { DEFAULT_SKETCH_PARAMETERS } from "../constants/palettes";
import type {
  EditorTool,
  GridCell,
  PathChain,
  SketchParameters,
} from "../types/sketch";

export interface HistoryEntry {
  params: SketchParameters;
  pathChains: PathChain[];
}

export const sketchParamsAtom = atom<SketchParameters>(
  DEFAULT_SKETCH_PARAMETERS,
);
export const pathChainsAtom = atom<PathChain[]>([]);

export const editorToolAtom = atom<EditorTool>("draw");
export const hoveredCellAtom = atom<GridCell | null>(null);
export const isDrawingAtom = atom<boolean>(false);

export const historyStackAtom = atom<HistoryEntry[]>([
  {
    params: JSON.parse(JSON.stringify(DEFAULT_SKETCH_PARAMETERS)),
    pathChains: [],
  },
]);
export const historyPointerAtom = atom<number>(0);

export const isPanelOpenAtom = atom<boolean>(true);

interface RecordingState {
  isRecording: boolean;
  elapsedSeconds: number;
}

export const recordingStateAtom = atom<RecordingState>({
  isRecording: false,
  elapsedSeconds: 0,
});

export const isAdjustingLightAngleAtom = atom<boolean>(false);
