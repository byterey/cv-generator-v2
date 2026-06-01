import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <span className="font-bold text-gray-900 text-lg">now-cv</span>
        <Link
          href="/signin"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Sign in →
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-3xl mx-auto w-full">
        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          5 free AI credits / month
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Your CV, tailored to every job.<br className="hidden sm:block" /> In seconds.
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl">
          Build an ATS-friendly CV, paste a job description, get an instant screening report,
          and download a tailored PDF — all without a recruiter.
        </p>
        <Link
          href="/signin"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl text-base transition-colors"
        >
          Get started — it&apos;s free
        </Link>
        <p className="text-xs text-gray-400 mt-3">No credit card required.</p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-t border-gray-100 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <Feature
            icon="📝"
            title="CV builder"
            description="Guided 6-step form — personal info, experience, skills, education, certifications, and projects. Saves to your account."
          />
          <Feature
            icon="🎯"
            title="JD analysis"
            description="Paste any job description and get an instant Tier A/B/C screening report across ATS, recruiter, and hiring manager lenses."
          />
          <Feature
            icon="📄"
            title="Tailored PDF"
            description="AI rewrites your bullets and summary to match the JD's exact language — without fabricating anything. Download a clean, selectable PDF."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-100">
        &copy; {new Date().getFullYear()} now-cv
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-2xl">{icon}</span>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
