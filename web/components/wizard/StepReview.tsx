import type { CvData } from '@/lib/cv-types';

interface Props {
  data: CvData;
}

export function StepReview({ data }: Props) {
  const { personal, experience, education, skills, certifications, projects } = data;

  return (
    <div className="space-y-6 text-sm">
      <h2 className="text-lg font-semibold text-gray-800">Review your CV</h2>

      <Section title="Personal">
        <Row label="Name" value={personal.name} />
        <Row label="Headline" value={personal.headline} />
        <Row label="Email" value={personal.email} />
        <Row label="Phone" value={personal.phone} />
        <Row label="Location" value={personal.location} />
        {personal.linkedin && <Row label="LinkedIn" value={personal.linkedin} />}
        {personal.github && <Row label="GitHub" value={personal.github} />}
        {personal.summary && <Row label="Summary" value={personal.summary} />}
      </Section>

      {experience.length > 0 && (
        <Section title={`Experience (${experience.length})`}>
          {experience.map((e, i) => (
            <div key={i} className="mb-3">
              <p className="font-medium text-gray-800">{e.role} at {e.company}</p>
              <p className="text-gray-500 text-xs">{e.location} · {e.start.year} - {e.current ? 'Present' : e.end.year}</p>
              <ul className="list-disc ml-4 mt-1 space-y-0.5 text-gray-600">
                {e.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title={`Education (${education.length})`}>
          {education.map((e, i) => (
            <div key={i} className="mb-2">
              <p className="font-medium text-gray-800">{e.institution}</p>
              <p className="text-gray-500 text-xs">{e.degree}{e.field ? `, ${e.field}` : ''} · {e.end.year}</p>
            </div>
          ))}
        </Section>
      )}

      {skills.length > 0 && (
        <Section title={`Skills (${skills.length} categories)`}>
          {skills.map((s, i) => (
            <p key={i}><span className="font-medium">{s.category}:</span> {s.items.join(', ')}</p>
          ))}
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title={`Certifications (${certifications.length})`}>
          {certifications.map((c, i) => (
            <p key={i}>{c.title} — {c.issuer}, {c.date.year}{c.note ? ` (${c.note})` : ''}</p>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title={`Projects (${projects.length})`}>
          {projects.map((p, i) => (
            <div key={i} className="mb-2">
              <p className="font-medium text-gray-800">{p.name}</p>
              {p.description && <p className="text-gray-600 text-xs">{p.description}</p>}
              {p.stack.length > 0 && <p className="text-gray-400 text-xs">{p.stack.join(', ')}</p>}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p><span className="text-gray-500">{label}: </span><span className="text-gray-800">{value}</span></p>
  );
}
