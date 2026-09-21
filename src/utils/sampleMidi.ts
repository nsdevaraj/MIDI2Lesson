// Utility to generate valid SMF Format 0 MIDI binary data for sample pieces

export interface SamplePiece {
  id: string;
  title: string;
  author: string;
  category: 1 | 2 | 3;
  level: 1 | 2 | 3;
  keySignature: string;
  keySf: number; // -7..7
  keyMi: number; // 0 major, 1 minor
  numerator: number;
  denominator: number;
  tempo: number;
  source: string;
  // sequence of [pitch, beats]
  melody: Array<[number, number]>;
}

export const SAMPLE_PIECES: SamplePiece[] = [
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    author: 'Ludwig van Beethoven',
    category: 3,
    level: 1,
    keySignature: 'C major',
    keySf: 0,
    keyMi: 0,
    numerator: 4,
    denominator: 4,
    tempo: 96,
    source: 'https://imslp.org/wiki/Symphony_No.9,_Op.125_(Beethoven,_Ludwig_van)',
    melody: [
      [64, 1], [64, 1], [65, 1], [67, 1],
      [67, 1], [65, 1], [64, 1], [62, 1],
      [60, 1], [60, 1], [62, 1], [64, 1],
      [64, 1.5], [62, 0.5], [62, 2],
      [64, 1], [64, 1], [65, 1], [67, 1],
      [67, 1], [65, 1], [64, 1], [62, 1],
      [60, 1], [60, 1], [62, 1], [64, 1],
      [62, 1.5], [60, 0.5], [60, 2],
    ],
  },
  {
    id: 'fur-elise',
    title: 'Fur Elise',
    author: 'Ludwig van Beethoven',
    category: 3,
    level: 2,
    keySignature: 'A minor',
    keySf: 0,
    keyMi: 1,
    numerator: 3,
    denominator: 8,
    tempo: 84,
    source: 'https://imslp.org/wiki/F%C3%BCr_Elise,_WoO_59_(Beethoven,_Ludwig_van)',
    melody: [
      [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5], [69, 1],
      [60, 0.5], [64, 0.5], [69, 0.5], [71, 1],
      [64, 0.5], [68, 0.5], [71, 0.5], [72, 1],
      [64, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5], [69, 1.5],
    ],
  },
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    author: 'Traditional / New Britain',
    category: 2,
    level: 1,
    keySignature: 'C major',
    keySf: 0,
    keyMi: 0,
    numerator: 3,
    denominator: 4,
    tempo: 72,
    source: 'https://en.wikipedia.org/wiki/Amazing_Grace',
    melody: [
      [67, 1], [72, 2], [76, 0.5], [72, 0.5], [76, 2], [74, 1], [72, 2], [69, 1], [67, 2],
      [67, 1], [72, 2], [76, 0.5], [72, 0.5], [76, 2], [74, 0.5], [76, 0.5], [79, 3],
    ],
  },
  {
    id: 'minuet-in-g',
    title: 'Minuet in G (Anh. 114)',
    author: 'Christian Petzold',
    category: 3,
    level: 1,
    keySignature: 'G major',
    keySf: 1,
    keyMi: 0,
    numerator: 3,
    denominator: 4,
    tempo: 84,
    source: 'https://imslp.org/wiki/Notebook_for_Anna_Magdalena_Bach_(Bach,_Johann_Sebastian)',
    melody: [
      [74, 1], [67, 0.5], [69, 0.5], [71, 0.5], [72, 0.5],
      [74, 1], [67, 1], [67, 1],
      [76, 1], [72, 0.5], [74, 0.5], [76, 0.5], [78, 0.5],
      [79, 1], [67, 1], [67, 1],
      [72, 1], [74, 0.5], [72, 0.5], [71, 0.5], [69, 0.5],
      [71, 1], [72, 0.5], [71, 0.5], [69, 0.5], [67, 0.5],
      [66, 1], [67, 0.5], [69, 0.5], [71, 0.5], [67, 0.5],
      [69, 3],
    ],
  },
  {
    id: 'frere-jacques',
    title: 'Frère Jacques',
    author: 'Traditional French round',
    category: 2,
    level: 1,
    keySignature: 'F major',
    keySf: -1,
    keyMi: 0,
    numerator: 4,
    denominator: 4,
    tempo: 88,
    source: 'https://en.wikipedia.org/wiki/Fr%C3%A8re_Jacques',
    melody: [
      [65, 1], [67, 1], [69, 1], [65, 1],
      [65, 1], [67, 1], [69, 1], [65, 1],
      [69, 1], [70, 1], [72, 2],
      [69, 1], [70, 1], [72, 2],
      [72, 0.5], [74, 0.5], [72, 0.5], [70, 0.5], [69, 1], [65, 1],
      [72, 0.5], [74, 0.5], [72, 0.5], [70, 0.5], [69, 1], [65, 1],
      [65, 1], [60, 1], [65, 2],
      [65, 1], [60, 1], [65, 2],
    ],
  },
];

function writeVarInt(bytes: number[], value: number): void {
  let buffer = value & 0x7f;
  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= 0x80;
    buffer += value & 0x7f;
  }
  while (true) {
    bytes.push(buffer & 0xff);
    if ((buffer & 0x80) !== 0) {
      buffer >>= 8;
    } else {
      break;
    }
  }
}

export function generateMidiFile(piece: SamplePiece): ArrayBuffer {
  const ticksPerBeat = 480;
  const trackBytes: number[] = [];

  // Track Name (Meta 0x03)
  const trackNameBytes = new TextEncoder().encode(piece.title);
  writeVarInt(trackBytes, 0); // delta 0
  trackBytes.push(0xff, 0x03);
  writeVarInt(trackBytes, trackNameBytes.length);
  trackBytes.push(...trackNameBytes);

  // Set Tempo (Meta 0x51)
  const tempoUs = Math.round(60000000 / piece.tempo);
  writeVarInt(trackBytes, 0);
  trackBytes.push(0xff, 0x51, 0x03);
  trackBytes.push((tempoUs >> 16) & 0xff, (tempoUs >> 8) & 0xff, tempoUs & 0xff);

  // Time Signature (Meta 0x58)
  // denominator is power of 2, e.g. 4 -> 2, 8 -> 3
  const denomExp = Math.round(Math.log2(piece.denominator));
  writeVarInt(trackBytes, 0);
  trackBytes.push(0xff, 0x58, 0x04);
  trackBytes.push(piece.numerator, denomExp, 24, 8);

  // Key Signature (Meta 0x59)
  const sfByte = piece.keySf < 0 ? 256 + piece.keySf : piece.keySf;
  writeVarInt(trackBytes, 0);
  trackBytes.push(0xff, 0x59, 0x02);
  trackBytes.push(sfByte & 0xff, piece.keyMi & 0x01);

  // Notes
  for (const [pitch, beatLength] of piece.melody) {
    const durationTicks = Math.round(beatLength * ticksPerBeat);

    // Note On (delta 0)
    writeVarInt(trackBytes, 0);
    trackBytes.push(0x90, pitch, 80); // Ch 0, Note, Vel 80

    // Note Off (delta = durationTicks)
    writeVarInt(trackBytes, durationTicks);
    trackBytes.push(0x80, pitch, 0);
  }

  // End of track (Meta 0x2F)
  writeVarInt(trackBytes, 0);
  trackBytes.push(0xff, 0x2f, 0x00);

  // Assemble full SMF
  const totalLength = 14 + 8 + trackBytes.length;
  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  // Header MThd
  view.setUint8(0, 0x4d); // M
  view.setUint8(1, 0x54); // T
  view.setUint8(2, 0x68); // h
  view.setUint8(3, 0x64); // d
  view.setUint32(4, 6, false); // Header length 6
  view.setUint16(8, 0, false); // Format 0 (single track)
  view.setUint16(10, 1, false); // 1 track
  view.setUint16(12, ticksPerBeat, false); // Ticks per beat

  // Track chunk MTrk
  view.setUint8(14, 0x4d); // M
  view.setUint8(15, 0x54); // T
  view.setUint8(16, 0x72); // r
  view.setUint8(17, 0x6b); // k
  view.setUint32(18, trackBytes.length, false);

  const uint8View = new Uint8Array(buffer, 22);
  uint8View.set(trackBytes);

  return buffer;
}
