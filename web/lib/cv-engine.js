import Handlebars from 'handlebars';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'default.html');

// ATS rule: sanitize non-ASCII punctuation at render time
export function sanitize(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–|—/g, '-')
    .replace(/…/g, '...');
}

export function sanitizeDeep(obj) {
  if (typeof obj === 'string') return sanitize(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeDeep);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitizeDeep(v)]));
  }
  return obj;
}

export function applyOverlay(cv, overlay) {
  const out = structuredClone(cv);

  if (overlay.headline) out.personal.headline = overlay.headline;
  if (overlay.summary) out.personal.summary = overlay.summary;
  if (overlay.meta?.sections) out.meta.sections = overlay.meta.sections;

  if (overlay.skills?.exclude_categories) {
    const excl = overlay.skills.exclude_categories;
    out.skills = out.skills.filter(s => !excl.includes(s.category));
  }

  if (overlay.skills?.category_order) {
    const order = overlay.skills.category_order;
    out.skills = [
      ...order.map(cat => out.skills.find(s => s.category === cat)).filter(Boolean),
      ...out.skills.filter(s => !order.includes(s.category)),
    ];
  }

  if (overlay.skills?.exclude_items) {
    const excl = overlay.skills.exclude_items;
    out.skills = out.skills.map(cat => ({
      ...cat,
      items: cat.items.filter(item => !excl.includes(item)),
    }));
  }

  if (overlay.certifications?.exclude) {
    const excl = overlay.certifications.exclude;
    if (out.certifications) {
      out.certifications = out.certifications.filter(c => !excl.includes(c.title));
    }
  }

  if (overlay.education?.exclude_by_field) {
    const excl = overlay.education.exclude_by_field;
    if (out.education) {
      out.education = out.education.filter(e => !excl.includes(e.field));
    }
  }

  if (overlay.experience_exclude) {
    out.experience = out.experience.filter(e => !overlay.experience_exclude.includes(e.company));
  }

  if (overlay.experience) {
    for (const oe of overlay.experience) {
      const entry = out.experience.find(e => e.company === oe.company);
      if (!entry) continue;

      if (oe.role) entry.role = oe.role;

      if (oe.bullet_rephrase) {
        for (const [idx, text] of Object.entries(oe.bullet_rephrase)) {
          entry.bullets[Number(idx)] = text;
        }
      }

      if (oe.bullet_order) {
        entry.bullets = oe.bullet_order.map(i => entry.bullets[i]).filter(Boolean);
      }
    }
  }

  return out;
}

function formatDate({ year, month }) {
  if (!month) return `${year}`;
  return new Date(year, month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

let _hbsRegistered = false;
function ensureHelpers() {
  if (_hbsRegistered) return;
  Handlebars.registerHelper('eq', (a, b) => a === b);
  Handlebars.registerHelper('formatDate', formatDate);
  Handlebars.registerHelper('markdown', (text) => new Handlebars.SafeString(marked.parse(text || '')));
  Handlebars.registerHelper('isCurrent', (exp) => exp.current === true);
  _hbsRegistered = true;
}

export function renderCv(cvData, overlayData) {
  ensureHelpers();
  let data = sanitizeDeep(cvData);
  if (overlayData) data = applyOverlay(data, overlayData);
  const templateSrc = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  return Handlebars.compile(templateSrc)(data);
}
