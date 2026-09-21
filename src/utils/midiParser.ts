import { ExtractedMidiData, MidiTrackInfo } from '../types';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const MAJOR_KEYS: Record<number, string> = {
  0: 'C major',
  1: 'G major',
  2: 'D major',
  3: 'A major',
  4: 'E major',
  5: 'B major',
  6: 'F# major',
  7: 'C# major',
  [-1]: 'F major',
  [-2]: 'Bb major',
  [-3]: 'Eb major',
  [-4]: 'Ab major',
  [-5]: 'Db major',
  [-6]: 'Gb major',
  [-7]: 'Cb major',
};

export const MINOR_KEYS: Record<number, string> = {
  0: 'A minor',
  1: 'E minor',
  2: 'B minor',
  3: 'F# minor',
  4: 'C# minor',
  5: 'G# minor',
  6: 'D# minor',
  7: 'A# minor',
  [-1]: 'D minor',
  [-2]: 'G minor',
  [-3]: 'C minor',
  [-4]: 'F minor',
  [-5]: 'Bb minor',
  [-6]: 'Eb minor',
  [-7]: 'Ab minor',
};

export function midiNoteToName(pitch: number): string {
  const note = NOTE_NAMES[((pitch % 12) + 12) % 12];
  const octave = Math.floor(pitch / 12) - 1;
  return `${note}${octave}`;
}

interface RawMidiEvent {
  delta: number;
  type: 'note_on' | 'note_off' | 'meta' | 'other';
  channel?: number;
  note?: number;
  velocity?: number;
  metaType?: number;
  metaData?: Uint8Array;
}

interface ParsedTrack {
  index: number;
  name: string;
  events: RawMidiEvent[];
  noteCount: number;
}

class ByteReader {
  private view: DataView;
  public pos: number = 0;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  get length(): number {
    return this.view.byteLength;
  }

  get remaining(): number {
    return this.view.byteLength - this.pos;
  }

  readUint8(): number {
    if (this.pos >= this.view.byteLength) return 0;
    const val = this.view.getUint8(this.pos);
    this.pos += 1;
    return val;
  }

  readInt8(): number {
    if (this.pos >= this.view.byteLength) return 0;
    const val = this.view.getInt8(this.pos);
    this.pos += 1;
    return val;
  }

  readUint16(): number {
    if (this.pos + 2 > this.view.byteLength) return 0;
    const val = this.view.getUint16(this.pos, false);
    this.pos += 2;
    return val;
  }

  readUint32(): number {
    if (this.pos + 4 > this.view.byteLength) return 0;
    const val = this.view.getUint32(this.pos, false);
    this.pos += 4;
    return val;
  }

  readString(len: number): string {
    let s = '';
    for (let i = 0; i < len; i++) {
      s += String.fromCharCode(this.readUint8());
    }
    return s;
  }

  readBytes(len: number): Uint8Array {
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = this.readUint8();
    }
    return arr;
  }

  readVarInt(): number {
    let result = 0;
    while (this.remaining > 0) {
      const b = this.readUint8();
      result = (result << 7) | (b & 0x7f);
      if ((b & 0x80) === 0) break;
    }
    return result;
  }

  skip(count: number): void {
    this.pos = Math.min(this.pos + count, this.view.byteLength);
  }
}

export function parseMidiFile(
  buffer: ArrayBuffer,
  fileName: string = 'piece.mid',
  preferredTrackIndex?: number
): ExtractedMidiData {
  const reader = new ByteReader(buffer);

  // Check header 'MThd'
  const headerTag = reader.readString(4);
  if (headerTag !== 'MThd') {
    throw new Error(`Invalid MIDI file header: expected "MThd", got "${headerTag}"`);
  }

  const headerLength = reader.readUint32();
  if (headerLength < 6) {
    throw new Error('Invalid MIDI header length');
  }

  const format = reader.readUint16();
  const numTracks = reader.readUint16();
  const division = reader.readUint16();

  // If header length > 6, skip extra header bytes
  if (headerLength > 6) {
    reader.skip(headerLength - 6);
  }

  let ticksPerBeat = 480;
  if ((division & 0x8000) === 0) {
    ticksPerBeat = division;
  } else {
    // SMPTE format fallback
    const framesPerSec = -(division >> 8);
    const ticksPerFrame = division & 0xff;
    ticksPerBeat = (framesPerSec * ticksPerFrame) || 480;
  }

  const parsedTracks: ParsedTrack[] = [];
  let globalTempoBpm = 120;
  let globalNumerator = 4;
  let globalDenominator = 4;
  let globalKeySignature = 'C major';
  let firstTrackName = '';

  for (let t = 0; t < numTracks && reader.remaining > 8; t++) {
    const chunkType = reader.readString(4);
    const chunkLength = reader.readUint32();
    const chunkEnd = reader.pos + chunkLength;

    if (chunkType !== 'MTrk') {
      // Skip unknown chunk
      reader.skip(chunkLength);
      continue;
    }

    const trackEvents: RawMidiEvent[] = [];
    let runningStatus = 0;
    let trackName = '';
    let trackNoteCount = 0;

    while (reader.pos < chunkEnd && reader.remaining > 0) {
      const delta = reader.readVarInt();
      let status = reader.readUint8();

      if (status < 0x80) {
        // Running status: current byte is actually first data byte
        if (runningStatus === 0) {
          continue;
        }
        reader.pos -= 1;
        status = runningStatus;
      } else if (status < 0xf0) {
        runningStatus = status;
      } else {
        // System / Meta message clears running status
        runningStatus = 0;
      }

      if (status === 0xff) {
        // Meta event
        const metaType = reader.readUint8();
        const metaLen = reader.readVarInt();
        const metaData = reader.readBytes(metaLen);

        if (metaType === 0x03 || metaType === 0x01) {
          const text = new TextDecoder('utf-8', { fatal: false }).decode(metaData).trim();
          if (!trackName && text) {
            trackName = text;
          }
          if (!firstTrackName && text) {
            firstTrackName = text;
          }
        } else if (metaType === 0x51 && metaLen >= 3) {
          const tempoUs = (metaData[0] << 16) | (metaData[1] << 8) | metaData[2];
          if (tempoUs > 0) {
            globalTempoBpm = Math.round(60000000 / tempoUs);
          }
        } else if (metaType === 0x58 && metaLen >= 2) {
          globalNumerator = metaData[0];
          globalDenominator = Math.pow(2, metaData[1]);
        } else if (metaType === 0x59 && metaLen >= 2) {
          // sf is signed 8-bit (-7 to 7)
          const rawSf = metaData[0];
          const sf = rawSf > 127 ? rawSf - 256 : rawSf;
          const mi = metaData[1]; // 0 = major, 1 = minor
          if (mi === 1) {
            globalKeySignature = MINOR_KEYS[sf] || 'A minor';
          } else {
            globalKeySignature = MAJOR_KEYS[sf] || 'C major';
          }
        }

        trackEvents.push({ delta, type: 'meta', metaType, metaData });
      } else if (status === 0xf0 || status === 0xf7) {
        // Sysex
        const len = reader.readVarInt();
        reader.skip(len);
      } else {
        const cmd = status & 0xf0;
        const channel = status & 0x0f;

        if (cmd === 0x80) {
          // Note off
          const note = reader.readUint8();
          const velocity = reader.readUint8();
          trackEvents.push({ delta, type: 'note_off', channel, note, velocity });
        } else if (cmd === 0x90) {
          // Note on
          const note = reader.readUint8();
          const velocity = reader.readUint8();
          if (velocity === 0) {
            trackEvents.push({ delta, type: 'note_off', channel, note, velocity: 0 });
          } else {
            trackNoteCount++;
            trackEvents.push({ delta, type: 'note_on', channel, note, velocity });
          }
        } else if (cmd === 0xa0 || cmd === 0xb0 || cmd === 0xe0) {
          // 2 data bytes
          reader.readUint8();
          reader.readUint8();
        } else if (cmd === 0xc0 || cmd === 0xd0) {
          // 1 data byte
          reader.readUint8();
        }
      }
    }

    // Move to end of chunk if not reached
    if (reader.pos < chunkEnd) {
      reader.pos = chunkEnd;
    }

    parsedTracks.push({
      index: t,
      name: trackName || `Track ${t + 1}`,
      events: trackEvents,
      noteCount: trackNoteCount,
    });
  }

  const tracksWithNotes = parsedTracks.filter((tr) => tr.noteCount > 0);
  if (tracksWithNotes.length === 0) {
    throw new Error('No musical notes found in this MIDI file');
  }

  // Choose track: preferred track if specified and valid, otherwise track with most notes
  let chosenTrack: ParsedTrack = tracksWithNotes[0];
  if (preferredTrackIndex !== undefined) {
    const match = parsedTracks.find((tr) => tr.index === preferredTrackIndex);
    if (match && match.noteCount > 0) {
      chosenTrack = match;
    }
  } else {
    // Pick the track with highest note count
    let maxCount = -1;
    for (const tr of tracksWithNotes) {
      if (tr.noteCount > maxCount) {
        maxCount = tr.noteCount;
        chosenTrack = tr;
      }
    }
  }

  // Extract monophonic note sequence matching python midi_to_lesson.py
  let absTime = 0;
  const active = new Map<number, number>(); // pitch -> start_tick
  const noteEvents: Array<{ start: number; end: number; pitch: number }> = [];

  for (const event of chosenTrack.events) {
    absTime += event.delta;

    if (event.type === 'note_on' && (event.velocity ?? 0) > 0 && event.note !== undefined) {
      active.set(event.note, absTime);
    } else if (
      (event.type === 'note_off' || (event.type === 'note_on' && event.velocity === 0)) &&
      event.note !== undefined
    ) {
      if (active.has(event.note)) {
        const start = active.get(event.note)!;
        active.delete(event.note);
        noteEvents.push({ start, end: absTime, pitch: event.note });
      }
    }
  }

  // Close any unclosed notes at the end
  for (const [pitch, start] of active.entries()) {
    noteEvents.push({ start, end: absTime, pitch });
  }

  if (noteEvents.length === 0) {
    throw new Error(`Track ${chosenTrack.index + 1} has no complete note events`);
  }

  // Sort by start time; for simultaneous starts keep highest pitch only (monophonic assumption)
  noteEvents.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.pitch - a.pitch; // highest pitch first
  });

  const filtered: Array<{ start: number; end: number; pitch: number }> = [];
  let lastStart = -1;
  for (const ev of noteEvents) {
    if (ev.start === lastStart) {
      continue; // already took highest pitch for this start tick
    }
    filtered.push(ev);
    lastStart = ev.start;
  }

  const notes: number[] = [];
  const durationsTicks: number[] = [];
  const startTimesTicks: number[] = [];

  for (const ev of filtered) {
    const dur = Math.max(ev.end - ev.start, 1);
    notes.push(ev.pitch);
    durationsTicks.push(dur);
    startTimesTicks.push(ev.start);
  }

  const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  const defaultTitle = chosenTrack.name && chosenTrack.name !== `Track ${chosenTrack.index + 1}`
    ? chosenTrack.name
    : (firstTrackName || cleanFileName.replace(/\b\w/g, (c) => c.toUpperCase()));

  const tracksSummary: MidiTrackInfo[] = parsedTracks.map((tr) => ({
    index: tr.index,
    name: tr.name,
    noteCount: tr.noteCount,
  }));

  return {
    fileName,
    title: defaultTitle || 'Untitled Piece',
    trackName: chosenTrack.name,
    tempoBpm: Math.max(40, Math.min(160, globalTempoBpm)),
    numerator: globalNumerator || 4,
    denominator: globalDenominator || 4,
    keySignature: globalKeySignature || 'C major',
    ticksPerBeat,
    tracks: tracksSummary,
    selectedTrackIndex: chosenTrack.index,
    notes,
    durationsTicks,
    startTimesTicks,
  };
}
