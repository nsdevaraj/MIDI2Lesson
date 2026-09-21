import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { LessonOutput } from '../types';

interface LessonOutputViewProps {
  output: LessonOutput;
  title: string;
}

export const LessonOutputView: React.FC<LessonOutputViewProps> = ({ output, title }) => {
  const [activeTab, setActiveTab] = useState<'snippet' | 'full' | 'json'>('snippet');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const currentContent =
    activeTab === 'snippet'
      ? output.tsSnippet
      : activeTab === 'full'
      ? output.fullTsFile
      : JSON.stringify(output.jsonSummary, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = currentContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (type: 'ts' | 'full' | 'json') => {
    let content = output.tsSnippet;
    let extension = 'ts';
    let filePrefix = (title || 'lesson').toLowerCase().replace(/[^a-z0-9]+/g, '_');

    if (type === 'full') {
      content = output.fullTsFile;
      extension = 'ts';
      filePrefix = `${filePrefix}_catalog`;
    } else if (type === 'json') {
      content = JSON.stringify(output.jsonSummary, null, 2);
      extension = 'json';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filePrefix}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Downloaded ${filePrefix}.${extension}`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-amber-600" />
              <span>Generated Lesson Code</span>
            </h2>
            {output.validationErrors.length === 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Assert Validated</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{output.validationErrors.length} Warnings</span>
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Ready to paste into <code className="font-mono text-stone-700 font-semibold">catal.txt</code> or export as a file
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Button */}
          <button
            type="button"
            id="btn-copy-lesson"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          {/* Download Dropdown / Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="btn-download-snippet"
              onClick={() => handleDownload('ts')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-stone-200 hover:bg-stone-50 text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download TypeScript snippet"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Download .ts</span>
            </button>
            <button
              type="button"
              id="btn-download-json"
              onClick={() => handleDownload('json')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-stone-200 hover:bg-stone-50 text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download JSON data"
            >
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>.json</span>
            </button>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Validation Warnings if any */}
      {output.validationErrors.length > 0 && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Virtuoso Catalog Warnings:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1">
            {output.validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 space-x-4">
        <button
          type="button"
          id="tab-snippet"
          onClick={() => setActiveTab('snippet')}
          className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'snippet'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          TypeScript Lesson Entry (new Lesson)
        </button>
        <button
          type="button"
          id="tab-full"
          onClick={() => setActiveTab('full')}
          className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'full'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Full TypeScript File (with Class & CATALOG)
        </button>
        <button
          type="button"
          id="tab-json"
          onClick={() => setActiveTab('json')}
          className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'json'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          JSON Summary
        </button>
      </div>

      {/* Code Editor / Display */}
      <div className="relative rounded-xl overflow-hidden bg-stone-900 border border-stone-800 shadow-inner">
        <div className="flex items-center justify-between px-3 py-1.5 bg-stone-950/80 border-b border-stone-800 text-[11px] text-stone-400 font-mono">
          <span>{activeTab === 'snippet' ? 'entry.ts' : activeTab === 'full' ? 'catalog.ts' : 'summary.json'}</span>
          <span>{currentContent.split('\n').length} lines</span>
        </div>
        <pre className="p-4 text-xs font-mono text-stone-100 overflow-x-auto whitespace-pre leading-relaxed scrollbar-thin scrollbar-thumb-stone-700">
          <code>{currentContent}</code>
        </pre>
      </div>
    </div>
  );
};
