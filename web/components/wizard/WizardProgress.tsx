const STEPS = [
  'Personal',
  'Experience',
  'Education',
  'Skills',
  'Extras',
  'Review',
];

interface WizardProgressProps {
  current: number; // 1-based
}

export function WizardProgress({ current }: WizardProgressProps) {
  return (
    <nav aria-label="Progress" className="flex items-center gap-1 overflow-x-auto pb-1">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center gap-1">
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap
                ${active ? 'bg-blue-600 text-white' : done ? 'bg-green-100 text-green-700' : 'text-gray-400'}`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${active ? 'bg-white text-blue-600' : done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {done ? '✓' : step}
              </span>
              {label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-4 shrink-0 ${done ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
