import React, { useRef, useState } from 'react';
import { UploadCloud, FileMusic, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ExtractedMidiData } from '../types';

interface MidiUploaderProps {
  onFileLoaded: (buffer: ArrayBuffer, fileName: string) => void;
  extractedData: ExtractedMidiData | null;
  error: string | null;
  isLoading: boolean;
}

export const MidiUploader: React.FC<MidiUploaderProps> = ({
  onFileLoaded,
  extractedData,
  error,
  isLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        onFileLoaded(buffer, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
          <FileMusic className="w-5 h-5 text-amber-600" />
          <span>MIDI File Input</span>
        </h2>
        {extractedData && (
          <button
            type="button"
            id="btn-upload-different"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-stone-100"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Change File</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        id="midi-file-input"
        accept=".mid,.midi"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        id="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-amber-500 bg-amber-50/50'
            : extractedData
            ? 'border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/40'
            : 'border-stone-300 hover:border-amber-400 bg-stone-50/60 hover:bg-stone-50'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          {isLoading ? (
            <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin my-1" />
          ) : extractedData ? (
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mb-1">
              <UploadCloud className="w-6 h-6" />
            </div>
          )}

          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-stone-800">
              {extractedData ? extractedData.fileName : 'Drop your MIDI (.mid, .midi) here'}
            </p>
            <p className="text-xs text-stone-500">
              {extractedData
                ? `Loaded ${extractedData.notes.length} notes across ${extractedData.tracks.length} track(s)`
                : 'or click to browse files from your computer'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {extractedData && (
        <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-stone-50 rounded-lg p-2 border border-stone-100">
            <span className="text-stone-400 block text-[11px]">Detected Tempo</span>
            <span className="font-semibold text-stone-800">{extractedData.tempoBpm} BPM</span>
          </div>
          <div className="bg-stone-50 rounded-lg p-2 border border-stone-100">
            <span className="text-stone-400 block text-[11px]">Time Signature</span>
            <span className="font-semibold text-stone-800">
              {extractedData.numerator}/{extractedData.denominator}
            </span>
          </div>
          <div className="bg-stone-50 rounded-lg p-2 border border-stone-100">
            <span className="text-stone-400 block text-[11px]">Key Signature</span>
            <span className="font-semibold text-stone-800">{extractedData.keySignature}</span>
          </div>
          <div className="bg-stone-50 rounded-lg p-2 border border-stone-100">
            <span className="text-stone-400 block text-[11px]">Ticks Per Beat</span>
            <span className="font-semibold text-stone-800">{extractedData.ticksPerBeat}</span>
          </div>
        </div>
      )}
    </div>
  );
};
