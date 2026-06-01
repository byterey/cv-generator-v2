'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ScreeningReport } from '@/components/analysis/ScreeningReport';
import { OutOfCredits } from '@/components/analysis/OutOfCredits';
import { TailoredResult } from '@/components/analysis/TailoredResult';
import type { CvData } from '@/lib/cv-types';

interface AnalysisState {
  tier: string;
  score: number;
  credits_remaining: number;
  [key: string]: unknown;
}

interface GenerationState {
  overlayData: unknown;
  html: string;
  credits_remaining: number;
}

export default function AnalyzePage() {
  const params = useParams();
  const cvId = params.id as string;

  const [cvData, setCvData] = useState<CvData | null>(null);
  const [cvName, setCvName] = useState('My CV');
  const [credits, setCredits] = useState<number | null>(null);
  const [resetAt, setResetAt] = useState('');
  const [jd, setJd] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<AnalysisState | null>(null);
  const [generating, setGenerating] = useState(false);
  const [tailored, setTailored] = useState<GenerationState | null>(null);
  const [savingNew, setSavingNew] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/cvs/${cvId}`)
      .then(r => r.json())
      .then(cv => {
        setCvData(cv.data);
        setCvName(cv.name);
      });
    fetch('/api/credits')
      .then(r => r.json())
      .then(c => {
        setCredits(c.credits_remaining);
        setResetAt(c.reset_at);
      });
  }, [cvId]);

  async function analyze() {
    setAnalyzing(true);
    setError('');
    setReport(null);
    setTailored(null);
    try {
      const res = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData, jdText: jd }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setResetAt(data.reset_at);
        setCredits(0);
        return;
      }
      if (!res.ok) throw new Error(data.error);
      setReport(data);
      setCredits(data.credits_remaining);
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData, jdText: jd }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setResetAt(data.reset_at);
        setCredits(0);
        return;
      }
      if (!res.ok) throw new Error(data.error);
      setTailored(data);
      setCredits(data.credits_remaining);
    } catch {
      setError('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function saveNewCv() {
    if (!tailored) return;
    setSavingNew(true);
    try {
      const res = await fetch('/api/cvs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${cvName} (tailored)`,
          data: cvData,
          overlay: tailored.overlayData,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
    } catch {
      setError('Save failed. Please try again.');
    } finally {
      setSavingNew(false);
    }
  }

  const outOfCredits = credits === 0;
  const canGenerate = report && (report.tier === 'A' || report.tier === 'B');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <Link href={`/cv/${cvId}/preview`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Preview
        </Link>
        <span className="text-sm font-semibold text-gray-800 flex-1 truncate">
          Analyze: {cvName}
        </span>
        {credits != null && (
          <span className="text-xs text-gray-400">
            {credits} / 5 credits
          </span>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* JD input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Paste the job description
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[180px]"
            placeholder="Paste the full job description here..."
            value={jd}
            onChange={e => setJd(e.target.value)}
          />
          <p className="text-xs text-gray-400 text-right">{jd.length} characters</p>
        </div>

        {outOfCredits ? (
          <OutOfCredits resetAt={resetAt} />
        ) : (
          <button
            type="button"
            onClick={analyze}
            disabled={!jd.trim() || analyzing || !cvData}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Analyzing your CV against this role...
              </>
            ) : (
              'Analyze (1 credit)'
            )}
          </button>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Report */}
        {report && (
          <div className="space-y-4">
            <ScreeningReport report={report as unknown as Parameters<typeof ScreeningReport>[0]['report']} />

            {/* Generate button — only for Tier A or B */}
            {canGenerate && !tailored && (
              <div className="border-t border-gray-200 pt-4">
                {outOfCredits ? (
                  <OutOfCredits resetAt={resetAt} />
                ) : (
                  <button
                    type="button"
                    onClick={generate}
                    disabled={generating}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {generating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Generating tailored CV...
                      </>
                    ) : (
                      'Generate tailored CV (1 credit)'
                    )}
                  </button>
                )}
              </div>
            )}

            {report.tier === 'C' && !tailored && (
              <p className="text-sm text-red-600 border-t border-gray-200 pt-4">
                Tier C — generation not recommended. Address the structural gaps first.
              </p>
            )}
          </div>
        )}

        {/* Tailored result */}
        {tailored && cvData && (
          <TailoredResult
            overlayData={tailored.overlayData}
            html={tailored.html}
            cvData={cvData}
            cvName={cvName}
            onSaveNew={saveNewCv}
            saving={savingNew}
          />
        )}
      </main>
    </div>
  );
}
