'use client';

import type { EducationEntry } from '@/lib/cv-types';

interface Props {
  data: EducationEntry[];
  onChange: (data: EducationEntry[]) => void;
}

const BLANK: EducationEntry = {
  institution: '', degree: '', field: '', end: { year: new Date().getFullYear() },
};

export function StepEducation({ data, onChange }: Props) {
  function update(i: number, entry: EducationEntry) {
    const next = [...data]; next[i] = entry; onChange(next);
  }
  function add() { onChange([...data, { ...BLANK }]); }
  function remove(i: number) { onChange(data.filter((_, j) => j !== i)); }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Education</h2>

      {data.map((entry, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Entry {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Institution">
              <input className={inp} value={entry.institution}
                onChange={e => update(i, { ...entry, institution: e.target.value })} />
            </Field>
            <Field label="Degree">
              <input className={inp} placeholder="B.Sc. / M.Sc. / Ph.D." value={entry.degree}
                onChange={e => update(i, { ...entry, degree: e.target.value })} />
            </Field>
            <Field label="Field of study">
              <input className={inp} placeholder="Computer Science" value={entry.field}
                onChange={e => update(i, { ...entry, field: e.target.value })} />
            </Field>
            <Field label="Graduation year">
              <input className={inp} type="number" min={1980} max={new Date().getFullYear() + 6}
                value={entry.end.year}
                onChange={e => update(i, { ...entry, end: { year: Number(e.target.value) } })} />
            </Field>
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
        + Add education
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
