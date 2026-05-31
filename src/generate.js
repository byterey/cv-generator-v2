import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import Handlebars from 'handlebars';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const htmlOnly = args.includes('--html-only');
const overlayArg = args.find(a => a.startsWith('--overlay'));
const overlayPath = overlayArg ? overlayArg.split('=')[1] ?? args[args.indexOf(overlayArg) + 1] : null;
const dataArg = args.find(a => a.startsWith('--data'));
const dataPath = dataArg ? dataArg.split('=')[1] ?? args[args.indexOf(dataArg) + 1] : path.join(ROOT, 'sample-data', 'cv.yml');

// ATS rule: sanitize non-ASCII punctuation at render time
function sanitize(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\u2026/g, '...');
}

function sanitizeDeep(obj) {
  if (typeof obj === 'string') return sanitize(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeDeep);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitizeDeep(v)]));
  }
  return obj;
}

function applyOverlay(cv, overlay) {
  const out = structuredClone(cv);

  if (overlay.headline) out.personal.headline = overlay.headline;
  if (overlay.summary) out.personal.summary = overlay.summary;
  if (overlay.meta?.sections) out.meta.sections = overlay.meta.sections;

  // Exclude skill categories
  if (overlay.skills?.exclude_categories) {
    const excl = overlay.skills.exclude_categories;
    out.skills = out.skills.filter(s => !excl.includes(s.category));
  }

  // Reorder skill categories
  if (overlay.skills?.category_order) {
    const order = overlay.skills.category_order;
    out.skills = [
      ...order.map(cat => out.skills.find(s => s.category === cat)).filter(Boolean),
      ...out.skills.filter(s => !order.includes(s.category)),
    ];
  }

  // Exclude specific skill items across all categories
  if (overlay.skills?.exclude_items) {
    const excl = overlay.skills.exclude_items;
    out.skills = out.skills.map(cat => ({
      ...cat,
      items: cat.items.filter(item => !excl.includes(item)),
    }));
  }

  // Exclude certifications by exact title
  if (overlay.certifications?.exclude) {
    const excl = overlay.certifications.exclude;
    if (out.certifications) {
      out.certifications = out.certifications.filter(c => !excl.includes(c.title));
    }
  }

  // Exclude education entries by field name
  if (overlay.education?.exclude_by_field) {
    const excl = overlay.education.exclude_by_field;
    if (out.education) {
      out.education = out.education.filter(e => !excl.includes(e.field));
    }
  }

  // Exclude companies from experience
  if (overlay.experience_exclude) {
    out.experience = out.experience.filter(e => !overlay.experience_exclude.includes(e.company));
  }

  // Reorder and rephrase bullets per experience entry
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

Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('formatDate', formatDate);
Handlebars.registerHelper('markdown', (text) => new Handlebars.SafeString(marked.parse(text || '')));
Handlebars.registerHelper('isCurrent', (exp) => exp.current === true);

let cv = sanitizeDeep(yaml.load(fs.readFileSync(dataPath, 'utf8')));

if (overlayPath) {
  const overlay = yaml.load(fs.readFileSync(path.resolve(overlayPath), 'utf8'));
  cv = applyOverlay(cv, overlay);
  console.log(`Overlay applied: ${overlayPath}`);
}

const templateSrc = fs.readFileSync(path.join(ROOT, 'templates', 'default.html'), 'utf8');
const html = Handlebars.compile(templateSrc)(cv);

// Output filename: cv.html or cv.<overlay-stem>.html
const stem = overlayPath
  ? path.basename(overlayPath, '-overlay.yml')
  : null;

const outDir = path.join(ROOT, 'output');
fs.mkdirSync(outDir, { recursive: true });

const htmlFile = stem ? `cv.${stem}.html` : 'cv.html';
const htmlOut = path.join(outDir, htmlFile);
fs.writeFileSync(htmlOut, html);
console.log(`HTML: ${htmlOut}`);

if (!htmlOnly) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${htmlOut}`, { waitUntil: 'networkidle0' });
  const pdfFile = stem ? `cv.${stem}.pdf` : 'cv.pdf';
  const pdfOut = path.join(outDir, pdfFile);
  await page.pdf({
    path: pdfOut,
    format: 'A4',
    margin: { top: '18mm', right: '18mm', bottom: '18mm', left: '18mm' },
    printBackground: true,
    tagged: true,
  });
  await browser.close();
  console.log(`PDF:  ${pdfOut}`);
}
