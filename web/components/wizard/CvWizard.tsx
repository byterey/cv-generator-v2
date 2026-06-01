'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardProgress } from './WizardProgress';
import { StepPersonal } from './StepPersonal';
import { StepExperience } from './StepExperience';
import { StepEducation } from './StepEducation';
import { StepSkills } from './StepSkills';
import { StepCertifications } from './StepCertifications';
import { StepProjects } from './StepProjects';
import { StepReview } from './StepReview';
import { EMPTY_CV, type CvData } from '@/lib/cv-types';

const TOTAL_STEPS = 6;

// Step 5 hosts both Certifications and Projects on two sub-tabs
type ExtrasTab = 'certifications' | 'projects';

interface Props {
  id?: string;
  initialName?: string;
  initialData?: CvData;
}

export function CvWizard({ id, initialName = 'My CV', initialData }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [extrasTab, setExtrasTab] = useState<ExtrasTab>('certifications');
  const [name, setName] = useState(initialName);
  const [editingName, setEditingName] = useState(false);
  const [data, setData] = useState<CvData>(initialData ?? EMPTY_CV);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Validation: required fields per step
  function canAdvance(): boolean {
    if (step === 1) return !!(data.personal.name.trim() && data.personal.email.trim());
    if (step === 2) return data.experience.length > 0 &&
      data.experience.every(e => e.company.trim() && e.role.trim() && e.bullets.some(b => b.trim()));
    if (step === 4) return data.skills.length > 0 &&
      data.skills.every(s => s.category.trim() && s.items.length > 0);
    return true;
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const body = JSON.stringify({ name, data });
      let res: Response;
      if (id) {
        res = await fetch(`/api/cvs/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
      } else {
        res = await fetch('/api/cvs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      }
      if (!res.ok) throw new Error('Save failed');
      if (!id) {
        const created = await res.json();
        router.push(`/cv/${created.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Dashboard
          </button>
          {editingName ? (
            <input
              autoFocus
              className="flex-1 text-sm font-semibold border-b border-blue-400 outline-none bg-transparent"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
            />
          ) : (
            <button
              className="flex-1 text-left text-sm font-semibold text-gray-800 hover:text-blue-600 truncate"
              onClick={() => setEditingName(true)}
              title="Click to rename"
            >
              {name}
            </button>
          )}
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <WizardProgress current={step} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {step === 1 && (
          <StepPersonal data={data.personal} onChange={p => setData({ ...data, personal: p })} />
        )}
        {step === 2 && (
          <StepExperience data={data.experience} onChange={e => setData({ ...data, experience: e })} />
        )}
        {step === 3 && (
          <StepEducation data={data.education} onChange={e => setData({ ...data, education: e })} />
        )}
        {step === 4 && (
          <StepSkills data={data.skills} onChange={s => setData({ ...data, skills: s })} />
        )}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex gap-4 border-b border-gray-200">
              {(['certifications', 'projects'] as ExtrasTab[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setExtrasTab(tab)}
                  className={`pb-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                    extrasTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {extrasTab === 'certifications' && (
              <StepCertifications data={data.certifications} onChange={c => setData({ ...data, certifications: c })} />
            )}
            {extrasTab === 'projects' && (
              <StepProjects data={data.projects} onChange={p => setData({ ...data, projects: p })} />
            )}
          </div>
        )}
        {step === 6 && <StepReview data={data} />}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </main>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
          >
            ← Back
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : id ? 'Save changes' : 'Save CV'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
