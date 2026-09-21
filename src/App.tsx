import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { MidiUploader } from './components/MidiUploader';
import { LessonConfigForm } from './components/LessonConfigForm';
import { NotesVisualizer } from './components/NotesVisualizer';
import { LessonOutputView } from './components/LessonOutputView';
import { ExtractedMidiData, LessonConfig } from './types';
import { parseMidiFile } from './utils/midiParser';
import { generateLessonOutput } from './utils/lessonConverter';
import { SAMPLE_PIECES, generateMidiFile, SamplePiece } from './utils/sampleMidi';
import { Info, HelpCircle } from 'lucide-react';

export default function App() {
  const [extractedData, setExtractedData] = useState<ExtractedMidiData | null>(null);
  const [currentBuffer, setCurrentBuffer] = useState<ArrayBuffer | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | undefined>('ode-to-joy');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customFingers, setCustomFingers] = useState<number[] | undefined>(undefined);

  const [config, setConfig] = useState<LessonConfig>({
    title: 'Ode to Joy',
    author: 'Ludwig van Beethoven',
    category: 3,
    level: 1,
    keySignature: 'C major',
    numerator: 4,
    denominator: 4,
    tempo: 96,
    source: 'https://imslp.org/wiki/Symphony_No.9,_Op.125_(Beethoven,_Ludwig_van)',
    quantize: 16,
    maxNotes: null,
    fingerMode: 'sequential',
    fixedFinger: 1,
    clampRange: true,
  });

  // Load default sample on initial mount
  useEffect(() => {
    loadSampleById('ode-to-joy');
  }, []);

  const loadSampleById = (sampleId: string) => {
    const piece = SAMPLE_PIECES.find((p) => p.id === sampleId);
    if (!piece) return;

    setIsLoading(true);
    setError(null);
    setActiveSampleId(sampleId);

    try {
      const buffer = generateMidiFile(piece);
      setCurrentBuffer(buffer);
      const parsed = parseMidiFile(buffer, `${piece.id}.mid`);
      setExtractedData(parsed);

      setConfig((prev) => ({
        ...prev,
        title: piece.title,
        author: piece.author,
        category: piece.category,
        level: piece.level,
        keySignature: piece.keySignature,
        numerator: piece.numerator,
        denominator: piece.denominator,
        tempo: piece.tempo,
        source: piece.source,
        maxNotes: null,
        fingerMode: 'sequential',
      }));

      setCustomFingers(undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to parse sample MIDI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileLoaded = (buffer: ArrayBuffer, fileName: string) => {
    setIsLoading(true);
    setError(null);
    setActiveSampleId(undefined);
    setCurrentBuffer(buffer);

    try {
      const parsed = parseMidiFile(buffer, fileName);
      setExtractedData(parsed);

      setConfig((prev) => ({
        ...prev,
        title: parsed.title,
        tempo: parsed.tempoBpm,
        numerator: parsed.numerator,
        denominator: parsed.denominator,
        keySignature: parsed.keySignature,
        source: `Converted from ${fileName}`,
        maxNotes: null,
      }));

      setCustomFingers(undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to parse uploaded MIDI file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackChange = (trackIndex: number) => {
    if (!currentBuffer) return;
    try {
      const parsed = parseMidiFile(
        currentBuffer,
        extractedData?.fileName || 'piece.mid',
        trackIndex
      );
      setExtractedData(parsed);
      setCustomFingers(undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to switch track');
    }
  };

  const handleConfigChange = (updates: Partial<LessonConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      // If finger mode or fixed finger changed, reset custom overrides
      if (
        (updates.fingerMode && updates.fingerMode !== prev.fingerMode) ||
        (updates.fixedFinger && updates.fixedFinger !== prev.fixedFinger)
      ) {
        setCustomFingers(undefined);
      }
      return next;
    });
  };

  const handleUpdateFinger = (index: number, newFinger: number) => {
    if (!output) return;
    const nextFingers = [...output.fingers];
    nextFingers[index] = newFinger;
    setCustomFingers(nextFingers);
  };

  // Compute lesson output
  const output = useMemo(() => {
    if (!extractedData || extractedData.notes.length === 0) return null;

    return generateLessonOutput(
      extractedData.notes,
      extractedData.durationsTicks,
      extractedData.ticksPerBeat,
      config,
      customFingers
    );
  }, [extractedData, config, customFingers]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      <Header onLoadSample={loadSampleById} activeSampleId={activeSampleId} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Upload & Parameters */}
          <div className="lg:col-span-5 space-y-5">
            <MidiUploader
              onFileLoaded={handleFileLoaded}
              extractedData={extractedData}
              error={error}
              isLoading={isLoading}
            />

            {extractedData && (
              <LessonConfigForm
                config={config}
                onChange={handleConfigChange}
                tracks={extractedData.tracks}
                selectedTrackIndex={extractedData.selectedTrackIndex}
                onTrackChange={handleTrackChange}
              />
            )}
          </div>

          {/* Right Column: Interactive Notes Timeline & Lesson Output */}
          <div className="lg:col-span-7 space-y-5">
            {output ? (
              <>
                <NotesVisualizer
                  notes={output.notes}
                  fingers={output.fingers}
                  beats={output.beats}
                  tempo={config.tempo}
                  onUpdateFinger={handleUpdateFinger}
                />

                <LessonOutputView output={output} title={config.title} />
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500 shadow-xs">
                <p className="text-sm">Load a sample or upload a MIDI file to generate a lesson.</p>
              </div>
            )}
          </div>
        </div>

        {/* Reference & Guidance Banner */}
        <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 text-xs text-stone-600 leading-relaxed">
              <h3 className="text-sm font-bold text-stone-900">
                Virtuoso Catalog Conversion Rules & Tips
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <li className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <span className="font-semibold text-stone-800 block mb-0.5">
                    1. Monophonic Melody Extraction
                  </span>
                  On simultaneous note starts, the converter automatically takes the highest pitch (soprano melody assumption).
                </li>
                <li className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <span className="font-semibold text-stone-800 block mb-0.5">
                    2. Automatic Finger Heuristics
                  </span>
                  Heuristics (sequential 5-finger span or scale) provide a starting baseline. You can adjust individual fingers in the timeline above.
                </li>
                <li className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <span className="font-semibold text-stone-800 block mb-0.5">
                    3. Supported Pitch Range
                  </span>
                  Virtuoso asserts pitch range [48, 89] (C3–F6) and tempo [40, 160]. Clamp Range keeps notes octave-safe automatically.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
