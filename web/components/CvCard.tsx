'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CvCardProps {
  id: string;
  name: string;
  updatedAt: string;
}

export function CvCard({ id, name, updatedAt }: CvCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const formatted = new Date(updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/cvs/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4 hover:border-gray-300 transition-colors">
      <div className="min-w-0">
        <p className="font-medium text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">Updated {formatted}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/cv/${id}/preview`}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Preview
        </Link>
        <Link
          href={`/cv/${id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
        >
          {deleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
