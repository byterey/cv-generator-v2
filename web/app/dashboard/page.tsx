import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { listCvs } from '@/lib/supabase/cvs';
import { getCredits } from '@/lib/supabase/credits';
import { CvCard } from '@/components/CvCard';
import { CreditBadge } from '@/components/CreditBadge';
import { SignOutButton } from '@/components/SignOutButton';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signin');

  const [cvs, credits] = await Promise.all([
    listCvs(),
    getCredits(user.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <span className="font-bold text-gray-900">now-cv</span>
          <div className="flex items-center gap-3">
            <CreditBadge
              remaining={credits.credits_remaining}
              resetAt={credits.reset_at}
            />
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Your CVs</h1>
          <Link
            href="/cv/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + New CV
          </Link>
        </div>

        {cvs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium mb-1">No CVs yet</p>
            <p className="text-sm mb-6">Create your first CV to get started.</p>
            <Link
              href="/cv/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Create CV
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cvs.map(cv => (
              <CvCard
                key={cv.id}
                id={cv.id}
                name={cv.name}
                updatedAt={cv.updated_at}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
