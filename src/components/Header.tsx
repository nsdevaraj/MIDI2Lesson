import React from 'react';
import { Music2, Sparkles, Piano, FileCode } from 'lucide-react';

interface HeaderProps {
  onLoadSample: (sampleId: string) => void;
  activeSampleId?: string;
}

export const Header: React.FC<HeaderProps> = ({ onLoadSample, activeSampleId }) => {
  return (
    <header className="border-b border-stone-200 bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs">
              <Piano className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  MIDI to Lesson Converter
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                  Virtuoso Format
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500">
                Transform MIDI files into typed TypeScript <code className="text-stone-700 font-mono font-medium">new Lesson(...)</code> catalog entries
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 md:pt-0">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider hidden sm:inline">
              Try samples:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                id="btn-sample-ode"
                onClick={() => onLoadSample('ode-to-joy')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  activeSampleId === 'ode-to-joy'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                Ode to Joy
              </button>
              <button
                type="button"
                id="btn-sample-fur-elise"
                onClick={() => onLoadSample('fur-elise')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  activeSampleId === 'fur-elise'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                Für Elise
              </button>
              <button
                type="button"
                id="btn-sample-minuet"
                onClick={() => onLoadSample('minuet-in-g')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  activeSampleId === 'minuet-in-g'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                Minuet in G
              </button>
              <button
                type="button"
                id="btn-sample-amazing"
                onClick={() => onLoadSample('amazing-grace')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  activeSampleId === 'amazing-grace'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                Amazing Grace
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
