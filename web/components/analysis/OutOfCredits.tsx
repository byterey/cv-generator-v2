interface Props {
  resetAt: string;
}

export function OutOfCredits({ resetAt }: Props) {
  const date = resetAt
    ? new Date(resetAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'next month';

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
      <p className="text-amber-800 font-medium mb-1">You&apos;ve used your 5 free AI credits for this month.</p>
      <p className="text-amber-700 text-sm">Come back on {date} for more.</p>
    </div>
  );
}
