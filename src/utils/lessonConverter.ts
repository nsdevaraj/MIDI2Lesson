import { FingerMode, LessonConfig, LessonOutput } from '../types';

export function clampNote(n: number): number {
  let note = n;
  while (note < 48) {
    note += 12;
  }
  while (note > 89) {
    note -= 12;
  }
  return note;
}

export function quantizeValue(value: number, resolution: number): number {
  if (resolution <= 0) return value;
  const step = 1.0 / resolution;
  return Math.round(value / step) * step;
}

export function ticksToBeats(
  durationsTicks: number[],
  ticksPerBeat: number,
  quantizeRes: number
): number[] {
  const beats: number[] = [];
  for (const t of durationsTicks) {
    let b = t / (ticksPerBeat || 480);
    b = quantizeValue(b, quantizeRes);
    if (b <= 0) {
      b = 1.0 / quantizeRes;
    }
    // Clean rounding: if very close to integer or fraction
    if (Math.abs(b - Math.round(b)) < 1e-5) {
      b = Math.round(b);
    } else {
      b = Math.round(b * 1000000) / 1000000;
    }
    beats.push(b);
  }
  return beats;
}

export function computeFingersSequential(notes: number[]): number[] {
  const fingers: number[] = [];
  const window: number[] = [];
  for (const n of notes) {
    window.push(n);
    if (window.length > 5) {
      window.shift();
    }
    const lo = Math.min(...window);
    const hi = Math.max(...window);
    const span = Math.max(hi - lo, 1);
    const f = 1 + Math.round((4 * (n - lo)) / span);
    fingers.push(Math.max(1, Math.min(5, f)));
  }
  return fingers;
}

export function computeFingersScale(notes: number[]): number[] {
  if (notes.length === 0) return [];
  const base = Math.min(...notes);
  const mapping: Record<number, number> = { 0: 1, 2: 2, 4: 3, 5: 1, 7: 2, 9: 3, 11: 4 };
  return notes.map((n) => {
    const degree = ((n - base) % 12 + 12) % 12;
    const f = mapping[degree] ?? (1 + (degree % 5));
    return Math.max(1, Math.min(5, f));
  });
}

export function computeFingersFixed(notes: number[], fixedFinger: number = 1): number[] {
  const f = Math.max(1, Math.min(5, Math.round(fixedFinger)));
  return new Array(notes.length).fill(f);
}

export function computeFingers(notes: number[], mode: FingerMode, fixedFinger: number = 1): number[] {
  switch (mode) {
    case 'scale':
      return computeFingersScale(notes);
    case 'fixed':
      return computeFingersFixed(notes, fixedFinger);
    case 'sequential':
    default:
      return computeFingersSequential(notes);
  }
}

export function formatTsArray(values: number[], isFloat: boolean = false): string {
  if (isFloat) {
    const parts = values.map((v) => {
      if (Number.isInteger(v)) {
        return v.toString();
      }
      // Check for common clean fractions like 1/3
      if (Math.abs(v - 1 / 3) < 0.001) return '0.333333';
      if (Math.abs(v - 2 / 3) < 0.001) return '0.666667';
      return v.toString();
    });
    return `[${parts.join(',')}]`;
  }
  return `[${values.map((v) => Math.round(v)).join(',')}]`;
}

export function validateLesson(
  notes: number[],
  fingers: number[],
  beats: number[],
  config: LessonConfig,
  guide: number[],
  guideFingers: number[]
): string[] {
  const errors: string[] = [];

  if (notes.length === 0) {
    errors.push('No notes available in the selected sequence.');
  }
  if (notes.length !== fingers.length) {
    errors.push(`Notes count (${notes.length}) does not match fingers count (${fingers.length}).`);
  }
  if (notes.length !== beats.length) {
    errors.push(`Notes count (${notes.length}) does not match beats count (${beats.length}).`);
  }
  if (config.category < 1 || config.category > 3) {
    errors.push(`Category must be between 1 and 3 (got ${config.category}).`);
  }
  if (config.level < 1 || config.level > 3) {
    errors.push(`Level must be between 1 and 3 (got ${config.level}).`);
  }
  if (config.tempo < 40 || config.tempo > 160) {
    errors.push(`Tempo must be between 40 and 160 BPM for Virtuoso catalog (got ${config.tempo}).`);
  }
  if (config.numerator <= 0 || config.denominator <= 0) {
    errors.push('Time signature numerator and denominator must be greater than 0.');
  }
  if (guide.length !== guideFingers.length) {
    errors.push('Guide pitches count must match guide fingers count.');
  }

  const outOfRangeNotes = notes.filter((n) => n < 48 || n > 89);
  if (outOfRangeNotes.length > 0) {
    errors.push(
      `${outOfRangeNotes.length} note(s) fall outside the Virtuoso supported range [48, 89] (C3 to F6). Enable auto-clamping to shift octaves.`
    );
  }

  const invalidFingers = fingers.filter((f) => f < 1 || f > 5);
  if (invalidFingers.length > 0) {
    errors.push(`${invalidFingers.length} finger values are outside the allowed range [1, 5].`);
  }

  const invalidBeats = beats.filter((b) => !Number.isFinite(b) || b <= 0);
  if (invalidBeats.length > 0) {
    errors.push('All beat durations must be finite numbers greater than 0.');
  }

  return errors;
}

export function generateLessonOutput(
  rawNotes: number[],
  rawDurationsTicks: number[],
  ticksPerBeat: number,
  config: LessonConfig,
  customFingers?: number[]
): LessonOutput {
  let notes = [...rawNotes];
  let durations = [...rawDurationsTicks];

  // Truncate if max notes specified
  if (config.maxNotes && config.maxNotes > 0 && notes.length > config.maxNotes) {
    notes = notes.slice(0, config.maxNotes);
    durations = durations.slice(0, config.maxNotes);
  }

  // Clamping
  if (config.clampRange) {
    notes = notes.map(clampNote);
  }

  // Durations to quantized beats
  const beats = ticksToBeats(durations, ticksPerBeat, config.quantize);

  // Fingering
  let fingers: number[];
  if (customFingers && customFingers.length === notes.length) {
    fingers = [...customFingers];
  } else {
    fingers = computeFingers(notes, config.fingerMode, config.fixedFinger);
  }

  // Derive guide & guideFingers
  const seen = new Set<number>();
  const guidePairs: Array<{ pitch: number; finger: number }> = [];

  for (let i = 0; i < notes.length; i++) {
    const p = notes[i];
    const f = fingers[i];
    if (!seen.has(p)) {
      seen.add(p);
      guidePairs.push({ pitch: p, finger: f });
    }
  }

  // Sort guide ascending by pitch
  guidePairs.sort((a, b) => a.pitch - b.pitch);
  const guide = guidePairs.map((p) => p.pitch);
  const guideFingers = guidePairs.map((p) => p.finger);

  const safeTempo = Math.max(40, Math.min(160, Math.round(config.tempo)));
  const safeTitle = (config.title || 'Untitled').replace(/"/g, '\\"');
  const safeAuthor = (config.author || 'Unknown').replace(/"/g, '\\"');
  const safeKey = (config.keySignature || 'C major').replace(/"/g, '\\"');
  const safeSource = (config.source || 'Converted from MIDI').replace(/"/g, '\\"');

  const tsSnippet = [
    `  new Lesson("${safeTitle}", "${safeAuthor}", ${config.category}, ${config.level}, "${safeKey}", ${config.numerator}, ${config.denominator}, ${safeTempo},`,
    `    ${formatTsArray(notes)},`,
    `    ${formatTsArray(fingers)},`,
    `    ${formatTsArray(beats, true)},`,
    `    ${formatTsArray(guide)}, ${formatTsArray(guideFingers)}, "${safeSource}"),`,
  ].join('\n');

  const fullTsFile = `// Generated by Virtuoso MIDI to Lesson Converter
// Date: ${new Date().toISOString()}

export class Lesson {
  title: string;
  author: string;
  category: number;
  level: number;
  keySignature: string;
  numerator: number;
  denominator: number;
  tempo: number;
  notes: number[];
  fingers: number[];
  beats: number[];
  guide: number[];
  guideFingers: number[];
  source: string;

  constructor(
    title: string,
    author: string,
    category: number,
    level: number,
    keySignature: string,
    numerator: number,
    denominator: number,
    tempo: number,
    notes: number[],
    fingers: number[],
    beats: number[],
    guide: number[],
    guideFingers: number[],
    source: string
  ) {
    this.title = title;
    this.author = author;
    this.category = category;
    this.level = level;
    this.keySignature = keySignature;
    this.numerator = numerator;
    this.denominator = denominator;
    this.tempo = tempo;
    this.notes = notes;
    this.fingers = fingers;
    this.beats = beats;
    this.guide = guide;
    this.guideFingers = guideFingers;
    this.source = source;
  }
}

export const CATALOG: Lesson[] = [
${tsSnippet}
];
`;

  const jsonSummary = {
    title: config.title,
    author: config.author,
    category: config.category,
    level: config.level,
    keySignature: config.keySignature,
    numerator: config.numerator,
    denominator: config.denominator,
    tempo: safeTempo,
    noteCount: notes.length,
    notes,
    fingers,
    beats,
    guide,
    guideFingers,
    source: config.source,
    quantizeResolution: config.quantize,
    fingerMode: config.fingerMode,
  };

  const validationErrors = validateLesson(notes, fingers, beats, { ...config, tempo: safeTempo }, guide, guideFingers);

  return {
    tsSnippet,
    fullTsFile,
    jsonSummary,
    validationErrors,
    notes,
    fingers,
    beats,
    guide,
    guideFingers,
  };
}
