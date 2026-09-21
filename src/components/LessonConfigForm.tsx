import React from 'react';
import { Sliders, HelpCircle, Layers, Music, User, Globe, Hash } from 'lucide-react';
import { CategoryId, FingerMode, LessonConfig, LevelId, MidiTrackInfo } from '../types';

interface LessonConfigFormProps {
  config: LessonConfig;
  onChange: (updates: Partial<LessonConfig>) => void;
  tracks: MidiTrackInfo[];
  selectedTrackIndex: number;
  onTrackChange: (trackIndex: number) => void;
}

export const LessonConfigForm: React.FC<LessonConfigFormProps> = ({
  config,
  onChange,
  tracks,
  selectedTrackIndex,
  onTrackChange,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-600" />
          <span>Lesson Parameters</span>
        </h2>
        <span className="text-xs text-stone-400">Customizable catalog metadata</span>
      </div>

      {/* Row 1: Title & Author */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="input-title" className="block text-xs font-semibold text-stone-700 mb-1">
            Lesson Title
          </label>
          <div className="relative">
            <input
              id="input-title"
              type="text"
              value={config.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g. Ode to Joy"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="input-author" className="block text-xs font-semibold text-stone-700 mb-1">
            Author / Composer
          </label>
          <div className="relative">
            <input
              id="input-author"
              type="text"
              value={config.author}
              onChange={(e) => onChange({ author: e.target.value })}
              placeholder="e.g. Ludwig van Beethoven"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Category & Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="select-category" className="block text-xs font-semibold text-stone-700 mb-1">
            Category
          </label>
          <select
            id="select-category"
            value={config.category}
            onChange={(e) => onChange({ category: Number(e.target.value) as CategoryId })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
          >
            <option value={1}>1 · Exercise / Etude</option>
            <option value={2}>2 · Folk / Traditional</option>
            <option value={3}>3 · Classical</option>
          </select>
        </div>

        <div>
          <label htmlFor="select-level" className="block text-xs font-semibold text-stone-700 mb-1">
            Difficulty Level
          </label>
          <select
            id="select-level"
            value={config.level}
            onChange={(e) => onChange({ level: Number(e.target.value) as LevelId })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
          >
            <option value={1}>1 · Beginner (Level 1)</option>
            <option value={2}>2 · Intermediate (Level 2)</option>
            <option value={3}>3 · Advanced (Level 3)</option>
          </select>
        </div>
      </div>

      {/* Row 3: Track Selection (if multiple) & Tempo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="select-track" className="block text-xs font-semibold text-stone-700 mb-1">
            MIDI Track Source
          </label>
          <select
            id="select-track"
            value={selectedTrackIndex}
            onChange={(e) => onTrackChange(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
          >
            {tracks.map((t) => (
              <option key={t.index} value={t.index}>
                Track {t.index + 1}: {t.name} ({t.noteCount} notes)
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="input-tempo" className="text-xs font-semibold text-stone-700">
              Tempo: <span className="text-amber-700 font-mono">{config.tempo} BPM</span>
            </label>
            <span className="text-[11px] text-stone-400">Asserted range [40–160]</span>
          </div>
          <input
            id="input-tempo"
            type="range"
            min={40}
            max={160}
            value={config.tempo}
            onChange={(e) => onChange({ tempo: Number(e.target.value) })}
            className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Row 4: Key Signature & Time Signature */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="input-key-signature" className="block text-xs font-semibold text-stone-700 mb-1">
            Key Signature
          </label>
          <input
            id="input-key-signature"
            type="text"
            value={config.keySignature}
            onChange={(e) => onChange({ keySignature: e.target.value })}
            placeholder="e.g. C major, A minor"
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
          />
        </div>

        <div>
          <label htmlFor="input-numerator" className="block text-xs font-semibold text-stone-700 mb-1">
            Time Sig (Numerator)
          </label>
          <input
            id="input-numerator"
            type="number"
            min={1}
            max={32}
            value={config.numerator}
            onChange={(e) => onChange({ numerator: Math.max(1, Number(e.target.value)) })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
          />
        </div>

        <div>
          <label htmlFor="input-denominator" className="block text-xs font-semibold text-stone-700 mb-1">
            Time Sig (Denominator)
          </label>
          <select
            id="select-denominator"
            value={config.denominator}
            onChange={(e) => onChange({ denominator: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
          >
            <option value={2}>2 (Half)</option>
            <option value={4}>4 (Quarter)</option>
            <option value={8}>8 (Eighth)</option>
            <option value={16}>16 (Sixteenth)</option>
          </select>
        </div>
      </div>

      {/* Row 5: Quantization & Fingering Heuristic */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="select-quantize" className="block text-xs font-semibold text-stone-700 mb-1">
            Beat Quantization
          </label>
          <select
            id="select-quantize"
            value={config.quantize}
            onChange={(e) => onChange({ quantize: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
          >
            <option value={4}>1/4 (Quarter Note)</option>
            <option value={8}>1/8 (Eighth Note)</option>
            <option value={16}>1/16 (Sixteenth Note - Default)</option>
            <option value={32}>1/32 (Thirty-Second Note)</option>
          </select>
        </div>

        <div>
          <label htmlFor="select-finger-mode" className="block text-xs font-semibold text-stone-700 mb-1">
            Fingering Heuristic
          </label>
          <select
            id="select-finger-mode"
            value={config.fingerMode}
            onChange={(e) => onChange({ fingerMode: e.target.value as FingerMode })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
          >
            <option value="sequential">Sequential (5-note hand span)</option>
            <option value="scale">Scale (Diatonic degrees)</option>
            <option value="fixed">Fixed Single Finger</option>
          </select>
        </div>

        {config.fingerMode === 'fixed' ? (
          <div>
            <label htmlFor="select-fixed-finger" className="block text-xs font-semibold text-stone-700 mb-1">
              Fixed Finger (1–5)
            </label>
            <select
              id="select-fixed-finger"
              value={config.fixedFinger}
              onChange={(e) => onChange({ fixedFinger: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
            >
              <option value={1}>1 · Thumb</option>
              <option value={2}>2 · Index</option>
              <option value={3}>3 · Middle</option>
              <option value={4}>4 · Ring</option>
              <option value={5}>5 · Pinky</option>
            </select>
          </div>
        ) : (
          <div>
            <label htmlFor="input-max-notes" className="block text-xs font-semibold text-stone-700 mb-1">
              Max Notes Excerpt
            </label>
            <input
              id="input-max-notes"
              type="number"
              min={1}
              value={config.maxNotes ?? ''}
              onChange={(e) =>
                onChange({ maxNotes: e.target.value ? Math.max(1, Number(e.target.value)) : null })
              }
              placeholder="All notes (no limit)"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
            />
          </div>
        )}
      </div>

      {/* Row 6: Attribution Source & Clamp Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div className="sm:col-span-2">
          <label htmlFor="input-source" className="block text-xs font-semibold text-stone-700 mb-1">
            Source URL or Attribution
          </label>
          <input
            id="input-source"
            type="text"
            value={config.source}
            onChange={(e) => onChange({ source: e.target.value })}
            placeholder="e.g. https://imslp.org/wiki/..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
          />
        </div>

        <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-800 block">Clamp Range [48–89]</span>
            <span className="text-[11px] text-stone-400 block">Octave-shift to fit</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="checkbox-clamp-range"
              checked={config.clampRange}
              onChange={(e) => onChange({ clampRange: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
