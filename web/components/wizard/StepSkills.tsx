'use client';

import type { SkillCategory } from '@/lib/cv-types';
import { TagInput } from '@/components/ui/TagInput';

interface Props {
  data: SkillCategory[];
  onChange: (data: SkillCategory[]) => void;
}

export function StepSkills({ data, onChange }: Props) {
  function update(i: number, cat: SkillCategory) {
    const next = [...data]; next[i] = cat; onChange(next);
  }
  function add() {
    onChange([...data, { category: '', items: [] }]);
  }
  function remove(i: number) {
    onChange(data.filter((_, j) => j !== i));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
      <p className="text-sm text-gray-500 -mt-3">
        Group skills by category (e.g. &ldquo;Cloud&rdquo;, &ldquo;Languages&rdquo;). Press Enter or comma to add a skill.
      </p>

      {data.map((cat, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Category {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">
              Remove
            </button>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Category name <span className="text-red-500">*</span></span>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              placeholder="e.g. Cloud, Languages, DevOps"
              value={cat.category}
              onChange={e => update(i, { ...cat, category: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Skills</span>
            <TagInput
              tags={cat.items}
              onChange={items => update(i, { ...cat, items })}
              placeholder="Type a skill and press Enter"
            />
          </label>
        </div>
      ))}

      <button type="button" onClick={add} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
        + Add category
      </button>
    </div>
  );
}
