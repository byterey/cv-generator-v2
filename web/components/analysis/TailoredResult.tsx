'use client';

import { useState } from 'react';
import { PdfDownloadButton } from '@/components/PdfDownloadButton';

interface Props {
  overlayData: unknown;
  html: string;
  cvData: unknown;
  cvName: string;
  onSaveNew: () => void;
  saving: boolean;
}

export function TailoredResult({ overlayData, html, cvData, cvName, onSaveNew, saving }: Props) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="border border-green-200 bg-green-50 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-green-800 font-medium text-sm">Tailored CV ready</p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPreview(v => !v)}
            className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
          >
            {showPreview ? 'Hide preview' : 'Show preview'}
          </button>
          <PdfDownloadButton
            cvData={cvData}
            overlayData={overlayData}
            filename={`${cvName.replace(/\s+/g, '-').toLowerCase()}-tailored.pdf`}
          />
          <button
            type="button"
            onClick={onSaveNew}
            disabled={saving}
            className="text-sm font-medium bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save as new CV'}
          </button>
        </div>
      </div>

      {showPreview && (
        <iframe
          srcDoc={html}
          className="w-full h-[600px] bg-white rounded-lg border border-green-200"
          title="Tailored CV preview"
          sandbox="allow-same-origin"
        />
      )}
    </div>
  );
}
