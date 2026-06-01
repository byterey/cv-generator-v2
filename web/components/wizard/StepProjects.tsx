'use client';

import type { ProjectEntry } from '@/lib/cv-types';
import { TagInput } from '@/components/ui/TagInput';

interface Props {
  data: ProjectEntry[];
  onChange: (data: ProjectEntry[]) => void;
}

const BLANK: ProjectEntry = { name: '', description: '', stack: [], url: '' };

export function StepProjects({ data, onChange }: Props) {
  function update(i: number, p: ProjectEntry) {
    const next = [...data]; next[i] = p; onChange(next);
  }
  function add() { onChange([...data, { ...BLANK }]); }
  function remove(i: number) { onChange(data.filter((_, j) => j !== i)); }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Projects</h2>
        <p className="text-sm text-gray-400 mt-0.5">Optional — skip if none.</p>
      </div>

      {data.map((proj, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Project {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Project name">
              <input className={inp} value={proj.name}
                onChange={e => update(i, { ...proj, name: e.target.value })} />
            </Field>
            <Field label="URL (optional)">
              <input className={inp} type="url" placeholder="https://github.com/..." value={proj.url}
                onChange={e => update(i, { ...proj, url: e.target.value })} />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={`${inp} resize-none`} rows={2} value={proj.description}
              onChange={e => update(i, { ...proj, description: e.target.value })} />
          </Field>
          <Field label="Tech stack">
            <TagInput
              tags={proj.stack}
              onChange={stack => update(i, { ...proj, stack })}
              placeholder="React, TypeScript, AWS..."
            />
          </Field>
        </div>
      ))}

      <button type="button" onClick={add} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
        + Add project
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
