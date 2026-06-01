interface CreditBadgeProps {
  remaining: number;
  total?: number;
  resetAt?: string;
}

export function CreditBadge({ remaining, total = 5, resetAt }: CreditBadgeProps) {
  const resetDate = resetAt
    ? new Date(resetAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <span
      title={resetDate ? `Resets on ${resetDate}` : undefined}
      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${remaining > 0 ? 'bg-green-500' : 'bg-red-400'}`}
        aria-hidden="true"
      />
      {remaining} / {total} credits
    </span>
  );
}
