import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCv } from '@/lib/supabase/cvs';
import { createClient } from '@/lib/supabase/server';
import { PdfDownloadButton } from '@/components/PdfDownloadButton';
import { PreviewFrame } from '@/components/PreviewFrame';
import type { CvData } from '@/lib/cv-types';

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signin');

  const cv = await getCv(params.id);
  if (!cv) notFound();

  const cvData = cv.data as unknown as CvData;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-wrap">
        <Link href={`/cv/${cv.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Edit
        </Link>
        <span className="text-sm font-semibold text-gray-800 flex-1 truncate">{cv.name}</span>
        <PdfDownloadButton
          cvData={cvData}
          filename={`${cv.name.replace(/\s+/g, '-').toLowerCase()}.pdf`}
        />
        <Link
          href={`/cv/${cv.id}/analyze`}
          className="text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Analyze against JD →
        </Link>
      </div>

      {/* Preview iframe */}
      <PreviewFrame cvData={cvData} />
    </div>
  );
}
