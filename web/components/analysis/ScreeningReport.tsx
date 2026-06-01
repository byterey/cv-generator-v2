import { TierBadge } from './TierBadge';

interface Report {
  tier: string;
  score: number;
  ats: Record<string, unknown>;
  recruiter: Record<string, unknown>;
  hiring_manager: Record<string, unknown>;
  strengths: string[];
  gaps: { structural: string[]; fixable: string[] };
  suggestions: string[];
  verdict: string;
}

export function ScreeningReport({ report }: { report: Report }) {
  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center gap-3">
        <TierBadge tier={report.tier} score={report.score} />
        <p className="text-gray-700 flex-1">{report.verdict}</p>
      </div>

      <ReportTable title="ATS Scan" rows={flattenAts(report.ats)} />
      <ReportTable title="Recruiter Screen" rows={flattenRecruiter(report.recruiter)} />
      <ReportTable title="Hiring Manager View" rows={flattenHm(report.hiring_manager)} />

      {report.strengths?.length > 0 && (
        <Section title="Strengths">
          <ul className="list-disc ml-4 space-y-1">
            {report.strengths.map((s, i) => <li key={i} className="text-gray-700">{s}</li>)}
          </ul>
        </Section>
      )}

      {(report.gaps?.structural?.length > 0 || report.gaps?.fixable?.length > 0) && (
        <Section title="Gaps">
          {report.gaps.structural?.length > 0 && (
            <div className="mb-2">
              <p className="font-medium text-gray-600 mb-1">Structural (hard to fix)</p>
              <ul className="list-disc ml-4 space-y-1">
                {report.gaps.structural.map((g, i) => <li key={i} className="text-red-700">{g}</li>)}
              </ul>
            </div>
          )}
          {report.gaps.fixable?.length > 0 && (
            <div>
              <p className="font-medium text-gray-600 mb-1">Fixable</p>
              <ul className="list-disc ml-4 space-y-1">
                {report.gaps.fixable.map((g, i) => <li key={i} className="text-amber-700">{g}</li>)}
              </ul>
            </div>
          )}
        </Section>
      )}

      {report.suggestions?.length > 0 && (
        <Section title="Suggestions">
          <ol className="list-decimal ml-4 space-y-1">
            {report.suggestions.map((s, i) => <li key={i} className="text-gray-700">{s}</li>)}
          </ol>
        </Section>
      )}
    </div>
  );
}

function ReportTable({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <Section title={title}>
      <table className="w-full text-xs border-collapse">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-gray-100 last:border-0">
              <td className="py-1.5 pr-4 text-gray-500 font-medium w-48 align-top">{label}</td>
              <td className="py-1.5 text-gray-800">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function str(v: unknown): string {
  if (v == null) return '-';
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if ('result' in o && 'detail' in o) return `${o.result} — ${o.detail}`;
    if ('result' in o && 'reason' in o) return `${o.result} — ${o.reason}`;
    if ('result' in o) return String(o.result);
    if ('bullets_total' in o) return `${o.outcome_driven} of ${o.bullets_total} outcome-driven`;
    if ('passive_openers' in o) {
      const arr = o.passive_openers as string[];
      return `${o.result}${arr.length ? ` — ${arr.join(', ')}` : ''}`;
    }
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) return (v as string[]).join(', ');
  return String(v);
}

function flattenAts(ats: Record<string, unknown>): [string, string][] {
  return [
    ['Hard filters', str(ats.hard_filters)],
    ['Title match', str(ats.title_match)],
    ['Keywords matched', Array.isArray(ats.keywords_matched) ? (ats.keywords_matched as string[]).join(', ') || 'None' : '-'],
    ['Keywords missing', Array.isArray(ats.keywords_missing) ? (ats.keywords_missing as string[]).join(', ') || 'None' : '-'],
    ['Years of experience', str(ats.years_of_experience)],
    ['Certifications', str(ats.certifications)],
  ];
}

function flattenRecruiter(r: Record<string, unknown>): [string, string][] {
  return [
    ['6-second scan', str(r.six_second_scan)],
    ['Tenure red flags', str(r.tenure_red_flags)],
    ['Career gaps', str(r.career_gaps)],
    ['Action verb density', str(r.action_verb_density)],
    ['Achievement density', str(r.achievement_density)],
    ['Credibility signals', str(r.credibility_signals)],
    ['Presentation readiness', str(r.presentation_readiness)],
  ];
}

function flattenHm(hm: Record<string, unknown>): [string, string][] {
  return [
    ['Career trajectory', str(hm.career_trajectory)],
    ['Domain credibility', str(hm.domain_credibility)],
    ['Leadership signal', str(hm.leadership_signal)],
    ['Impact in bullets', str(hm.impact_in_bullets)],
    ['Narrative consistency', str(hm.narrative_consistency)],
    ['Sponsorship risk', str(hm.sponsorship_risk)],
  ];
}
