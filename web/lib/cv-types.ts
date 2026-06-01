export interface PersonalInfo {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  location: string;
  start: { year: number; month: number };
  end: { year: number; month: number };
  current: boolean;
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  end: { year: number };
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface CertificationEntry {
  title: string;
  issuer: string;
  date: { year: number; month?: number };
  note: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  stack: string[];
  url: string;
}

export interface CvData {
  personal: PersonalInfo;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillCategory[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
  meta: { sections: string[] };
}

export const EMPTY_CV: CvData = {
  personal: {
    name: '', headline: '', email: '', phone: '',
    location: '', linkedin: '', github: '', summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  meta: {
    sections: ['experience', 'skills', 'education', 'certifications', 'projects'],
  },
};
