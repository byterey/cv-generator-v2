'use client';

import type { PersonalInfo } from '@/lib/cv-types';

interface Props {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export function StepPersonal({ data, onChange }: Props) {
  function field(key: keyof PersonalInfo) {
    return {
      value: data[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange({ ...data, [key]: e.target.value }),
    };
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Personal information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name" required>
          <input className={input} placeholder="Jane Smith" {...field('name')} />
        </Field>
        <Field label="Professional headline">
          <input className={input} placeholder="Senior Software Engineer" {...field('headline')} />
        </Field>
        <Field label="Email" required>
          <input className={input} type="email" placeholder="jane@example.com" {...field('email')} />
        </Field>
        <Field label="Phone">
          <input className={input} placeholder="+1 555 000 0000" {...field('phone')} />
        </Field>
        <Field label="Location">
          <input className={input} placeholder="London, UK" {...field('location')} />
        </Field>
        <Field label="LinkedIn URL">
          <input className={input} placeholder="linkedin.com/in/janesmith" {...field('linkedin')} />
        </Field>
        <Field label="GitHub URL">
          <input className={input} placeholder="github.com/janesmith" {...field('github')} />
        </Field>
      </div>

      <Field label="Professional summary">
        <textarea
          className={`${input} min-h-[100px] resize-y`}
          placeholder="2-3 sentences about your background and what you bring to the role."
          {...field('summary')}
        />
      </Field>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

const input = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full';
