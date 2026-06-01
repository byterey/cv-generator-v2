'use client';

import type { CertificationEntry } from '@/lib/cv-types';

interface Props {
  data: CertificationEntry[];
  onChange: (data: CertificationEntry[]) => void;
}

const BLANK: CertificationEntry = {
  title: '', issuer: '', date: { year: new Date().getFullYear() }, note: '',
};

export function StepCertifications({ data, onChange }: Props) {
  function update(i: number, c: CertificationEntry) {
    const next = [...data]; next[i] = c; onChange(next);
  }
  function add() { onChange([...data, { ...BLANK }]); }
  function remove(i: number) { onChange(data.filter((_, j) => j !== i)); }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Certifications</h2>
        <p className="text-sm text-gray-400 mt-0.5">Optional — skip if none.</p>
      </div>

      {data.map((cert, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Certification {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Title">
              <input className={inp} placeholder="AWS Solutions Architect" value={cert.title}
                onChange={e => update(i, { ...cert, title: e.target.value })} />
            </Field>
            <Field label="Issuer">
              <input className={inp} placeholder="Amazon Web Services" value={cert.issuer}
                onChange={e => update(i, { ...cert, issuer: e.target.value })} />
            </Field>
            <Field label="Year">
              <input className={inp} type="number" min={2000} max={new Date().getFullYear() + 5}
                value={cert.date.year}
                onChange={e => update(i, { ...cert, date: { ...cert.date, year: Number(e.target.value) } })} />
            </Field>
            <Field label="Note (optional)">
              <input className={inp} placeholder="e.g. In progress" value={cert.note}
                onChange={e => update(i, { ...cert, note: e.target.value })} />
            </Field>
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
        + Add certification
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  );
}

const inp = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full';
