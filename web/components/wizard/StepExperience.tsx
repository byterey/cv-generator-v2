'use client';

import type { ExperienceEntry } from '@/lib/cv-types';

interface Props {
  data: ExperienceEntry[];
  onChange: (data: ExperienceEntry[]) => void;
}

const BLANK: ExperienceEntry = {
  company: '', role: '', location: '',
  start: { year: new Date().getFullYear(), month: 1 },
  end: { year: new Date().getFullYear(), month: 1 },
  current: false,
  bullets: [''],
};

export function StepExperience({ data, onChange }: Props) {
  function update(index: number, entry: ExperienceEntry) {
    const next = [...data];
    next[index] = entry;
    onChange(next);
  }

  function add() {
    onChange([...data, { ...BLANK, bullets: [''] }]);
  }

  function remove(index: number) {
    const entry = data[index];
    const hasContent = entry.company || entry.role || entry.bullets.some(b => b);
    if (hasContent && !confirm('Remove this role? All data will be lost.')) return;
    onChange(data.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Work experience</h2>

      {data.length === 0 && (
        <p className="text-sm text-gray-400">Add at least one role.</p>
      )}

      {data.map((entry, i) => (
        <ExperienceForm
          key={i}
          entry={entry}
          index={i}
          total={data.length}
          onChange={e => update(i, e)}
          onRemove={() => remove(i)}
        />
      ))}

      <button
        type="button"
        onClick={add}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        + Add role
      </button>
    </div>
  );
}

function ExperienceForm({
  entry, index, total, onChange, onRemove,
}: {
  entry: ExperienceEntry;
  index: number;
  total: number;
  onChange: (e: ExperienceEntry) => void;
  onRemove: () => void;
}) {
  const set = (key: keyof ExperienceEntry, value: unknown) =>
    onChange({ ...entry, [key]: value });

  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600">Role {index + 1}</span>
        {total > 0 && (
          <button type="button" onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Company" required>
          <input className={inp} value={entry.company} onChange={e => set('company', e.target.value)} />
        </Field>
        <Field label="Job title" required>
          <input className={inp} value={entry.role} onChange={e => set('role', e.target.value)} />
        </Field>
        <Field label="Location">
          <input className={inp} value={entry.location} onChange={e => set('location', e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
        <Field label="Start month">
          <MonthSelect value={entry.start.month} onChange={m => set('start', { ...entry.start, month: m })} />
        </Field>
        <Field label="Start year">
          <YearInput value={entry.start.year} onChange={y => set('start', { ...entry.start, year: y })} />
        </Field>
        {!entry.current && (
          <>
            <Field label="End month">
              <MonthSelect value={entry.end.month} onChange={m => set('end', { ...entry.end, month: m })} />
            </Field>
            <Field label="End year">
              <YearInput value={entry.end.year} onChange={y => set('end', { ...entry.end, year: y })} />
            </Field>
          </>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={entry.current}
          onChange={e => set('current', e.target.checked)}
          className="rounded border-gray-300"
        />
        Current role
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Bullets <span className="text-red-500">*</span></span>
        {entry.bullets.map((bullet, bi) => (
          <div key={bi} className="flex gap-2">
            <textarea
              className={`${inp} resize-none flex-1`}
              rows={2}
              value={bullet}
              onChange={e => {
                const b = [...entry.bullets];
                b[bi] = e.target.value;
                set('bullets', b);
              }}
              placeholder="Led migration of monolith to microservices, reducing deploy time by 60%."
            />
            {entry.bullets.length > 1 && (
              <button
                type="button"
                onClick={() => set('bullets', entry.bullets.filter((_, j) => j !== bi))}
                className="text-xs text-red-400 hover:text-red-600 self-start pt-2"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => set('bullets', [...entry.bullets, ''])}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          + Add bullet
        </button>
      </div>
    </div>
  );
}

function MonthSelect({ value, onChange }: { value: number; onChange: (m: number) => void }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <select className={inp} value={value} onChange={e => onChange(Number(e.target.value))}>
      {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
    </select>
  );
}

function YearInput({ value, onChange }: { value: number; onChange: (y: number) => void }) {
  return (
    <input
      className={inp}
      type="number"
      min={1980}
      max={new Date().getFullYear() + 2}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
    />
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

const inp = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full';
