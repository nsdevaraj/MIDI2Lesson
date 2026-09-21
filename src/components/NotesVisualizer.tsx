import React, { useState, useEffect } from 'react';
import { Play, Square, Volume2, Music, Sparkles, Edit3 } from 'lucide-react';
import { midiNoteToName } from '../utils/midiParser';
import { audioPlayer } from '../utils/audioPlayer';

interface NotesVisualizerProps {
  notes: number[];
  fingers: number[];
  beats: number[];
  tempo: number;
  onUpdateFinger?: (index: number, newFinger: number) => void;
}

export const NotesVisualizer: React.FC<NotesVisualizerProps> = ({
  notes,
  fingers,
  beats,
  tempo,
  onUpdateFinger,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number>(-1);

  useEffect(() => {
    audioPlayer.setCallbacks(
      (index) => {
        setActiveNoteIndex(index);
      },
      () => {
        setIsPlaying(false);
        setActiveNoteIndex(-1);
      }
    );

    return () => {
      audioPlayer.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioPlayer.stop();
      setIsPlaying(false);
      setActiveNoteIndex(-1);
    } else {
      setIsPlaying(true);
      audioPlayer.playSequence(notes, beats, tempo);
    }
  };

  const handlePlaySingleNote = (pitch: number) => {
    audioPlayer.playNoteOnce(pitch, 0.35);
  };

  // Calculate unique pitches for the guide view
  const uniquePitches = Array.from(new Set(notes)).sort((a, b) => a - b);
  const minPitch = notes.length > 0 ? Math.min(...notes) : 60;
  const maxPitch = notes.length > 0 ? Math.max(...notes) : 72;

  // Finger labels
  const fingerNames = ['', '1 (Thumb)', '2 (Index)', '3 (Middle)', '4 (Ring)', '5 (Pinky)'];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
              <Music className="w-5 h-5 text-amber-600" />
              <span>Notes & Fingering Timeline</span>
            </h2>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
              {notes.length} notes
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Range: <span className="font-medium text-stone-700">{midiNoteToName(minPitch)}</span> ({minPitch}) →{' '}
            <span className="font-medium text-stone-700">{midiNoteToName(maxPitch)}</span> ({maxPitch}) · Click any note to preview pitch or edit finger
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-play-preview"
            onClick={handleTogglePlay}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Preview</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Melody Synth</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Guide notes strip (unique pitches) */}
      <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-100">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-stone-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Guide Notes ({uniquePitches.length} unique pitches)</span>
          </span>
          <span className="text-[11px] text-stone-400">Pitches learned in this lesson</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {uniquePitches.map((p) => {
            const firstIdx = notes.indexOf(p);
            const f = firstIdx >= 0 ? fingers[firstIdx] : 1;
            const isPlayingThis = activeNoteIndex >= 0 && notes[activeNoteIndex] === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePlaySingleNote(p)}
                className={`px-2 py-1 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  isPlayingThis
                    ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-stone-800 border-stone-200'
                }`}
              >
                <span className="font-bold">{midiNoteToName(p)}</span>
                <span className="text-[10px] text-stone-400 font-sans">({p})</span>
                <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-sans font-bold">
                  F{f}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sequence Note Strip */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span>Melody Note Sequence</span>
          <span className="text-[11px] text-stone-400">Scroll horizontally to view all notes</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-stone-300">
          {notes.map((pitch, idx) => {
            const finger = fingers[idx] || 1;
            const beat = beats[idx] || 1;
            const isActive = activeNoteIndex === idx;

            return (
              <div
                key={idx}
                id={`note-card-${idx}`}
                className={`shrink-0 w-20 p-2.5 rounded-xl border transition-all text-center flex flex-col justify-between ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-md ring-2 ring-amber-400 ring-offset-1'
                    : 'bg-stone-50/90 hover:bg-stone-100 text-stone-800 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-75 font-mono mb-1">
                  <span>#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handlePlaySingleNote(pitch)}
                    title="Play note"
                    className="cursor-pointer hover:opacity-100 p-0.5"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>

                <div
                  className="cursor-pointer my-1"
                  onClick={() => handlePlaySingleNote(pitch)}
                >
                  <div className="text-sm font-bold font-mono tracking-tight">
                    {midiNoteToName(pitch)}
                  </div>
                  <div className={`text-[10px] ${isActive ? 'text-amber-100' : 'text-stone-400'} font-mono`}>
                    MIDI {pitch}
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  {/* Finger selector */}
                  <div className="flex items-center justify-center">
                    {onUpdateFinger ? (
                      <select
                        aria-label={`Finger for note ${idx + 1}`}
                        value={finger}
                        onChange={(e) => onUpdateFinger(idx, Number(e.target.value))}
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded border text-center cursor-pointer ${
                          isActive
                            ? 'bg-amber-600 text-white border-amber-400'
                            : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
                        }`}
                      >
                        <option value={1}>F1</option>
                        <option value={2}>F2</option>
                        <option value={3}>F3</option>
                        <option value={4}>F4</option>
                        <option value={5}>F5</option>
                      </select>
                    ) : (
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                        F{finger}
                      </span>
                    )}
                  </div>

                  {/* Beat badge */}
                  <div className={`text-[10px] font-medium ${isActive ? 'text-amber-100' : 'text-stone-500'}`}>
                    {beat} {beat === 1 ? 'beat' : 'beats'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
