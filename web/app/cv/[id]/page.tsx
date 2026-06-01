import { notFound } from 'next/navigation';
import { getCv } from '@/lib/supabase/cvs';
import { CvWizard } from '@/components/wizard/CvWizard';
import type { CvData } from '@/lib/cv-types';

export default async function EditCvPage({ params }: { params: { id: string } }) {
  const cv = await getCv(params.id);
  if (!cv) notFound();

  return <CvWizard id={cv.id} initialName={cv.name} initialData={cv.data as unknown as CvData} />;
}
