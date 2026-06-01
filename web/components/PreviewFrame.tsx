'use client';

import { useEffect, useState } from 'react';

interface Props {
  cvData: unknown;
  overlayData?: unknown;
}

export function PreviewFrame({ cvData, overlayData }: Props) {
  const [srcDoc, setSrcDoc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/generate-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvData, overlayData }),
    })
      .then(r => r.text())
      .then(html => { setSrcDoc(html); setLoading(false); })
      .catch(() => setLoading(false));
  }, [cvData, overlayData]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Loading preview...
      </div>
    );
  }

  return (
    <iframe
      srcDoc={srcDoc}
      className="flex-1 w-full bg-white"
      title="CV preview"
      sandbox="allow-same-origin"
    />
  );
}
