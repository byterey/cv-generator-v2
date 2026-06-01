const TIER_STYLES: Record<string, string> = {
  A: 'bg-green-100 text-green-800 border-green-200',
  B: 'bg-amber-100 text-amber-800 border-amber-200',
  C: 'bg-red-100 text-red-800 border-red-200',
};

export function TierBadge({ tier, score }: { tier: string; score?: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full border ${TIER_STYLES[tier] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      Tier {tier}
      {score != null && <span className="font-normal opacity-70">· {score}%</span>}
    </span>
  );
}
