export type CategoryId = 1 | 2 | 3;
export type LevelId = 1 | 2 | 3;
export type FingerMode = 'sequential' | 'scale' | 'fixed';

export interface MidiTrackInfo {
  index: number;
  name: string;
  noteCount: number;
  channel?: number;
}

export interface ExtractedMidiData {
  fileName: string;
  title: string;
  trackName: string;
  tempoBpm: number;
  numerator: number;
  denominator: number;
  keySignature: string;
  ticksPerBeat: number;
  tracks: MidiTrackInfo[];
  selectedTrackIndex: number;
  notes: number[];
  durationsTicks: number[];
  startTimesTicks: number[];
}

export interface LessonNoteItem {
  id: string;
  pitch: number;
  noteName: string;
  octave: number;
  finger: number;
  beat: number;
  rawBeat: number;
  startTick: number;
  durationTick: number;
}

export interface LessonConfig {
  title: string;
  author: string;
  category: CategoryId;
  level: LevelId;
  keySignature: string;
  numerator: number;
  denominator: number;
  tempo: number;
  source: string;
  quantize: number;
  maxNotes: number | null;
  fingerMode: FingerMode;
  fixedFinger: number;
  clampRange: boolean;
}

export interface LessonOutput {
  tsSnippet: string;
  fullTsFile: string;
  jsonSummary: Record<string, unknown>;
  validationErrors: string[];
  notes: number[];
  fingers: number[];
  beats: number[];
  guide: number[];
  guideFingers: number[];
}
