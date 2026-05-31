import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const jdPath = args[0];
if (!jdPath) {
  console.error('Usage: node src/tailor.js <jd-file.txt> [--data sample-data/cv.yml]');
  process.exit(1);
}
const dataArg = args.find(a => a.startsWith('--data'));
const dataPath = dataArg ? dataArg.split('=')[1] ?? args[args.indexOf(dataArg) + 1] : path.join(ROOT, 'sample-data', 'cv.yml');

const jdText = fs.readFileSync(path.resolve(jdPath), 'utf8');
const cv = yaml.load(fs.readFileSync(dataPath, 'utf8'));

// Extract candidate terms from JD (words 4+ chars, lowercased, deduped)
const stopWords = new Set(['that','this','with','have','will','from','your','their',
  'been','they','also','more','into','than','each','when','which','other','about',
  'across','these','those','both','such','were','what','some','team','work','able']);

const jdTerms = [...new Set(
  jdText.toLowerCase().match(/\b[a-z][a-z0-9#+.-]{3,}\b/g) ?? []
)].filter(t => !stopWords.has(t));

// Score each bullet in each experience entry against JD terms
const scored = cv.experience.map(exp => {
  const bullets = exp.bullets.map((bullet, idx) => {
    const b = bullet.toLowerCase();
    const hits = jdTerms.filter(t => b.includes(t));
    return { idx, score: hits.length, hits: hits.slice(0, 5), text: bullet.slice(0, 80) };
  });
  bullets.sort((a, b) => b.score - a.score);
  return { company: exp.company, role: exp.role, bullets };
});

// Score skill categories
const skillScores = cv.skills.map(s => {
  const hits = s.items.filter(item => jdTerms.some(t => item.toLowerCase().includes(t)));
  return { category: s.category, score: hits.length, hits };
});
skillScores.sort((a, b) => b.score - a.score);

console.log('\n=== JD ANALYSIS ===');
console.log(`JD: ${jdPath}`);
console.log(`\nTop JD keywords: ${jdTerms.slice(0, 20).join(', ')}`);

console.log('\n--- Skill category relevance (ranked) ---');
skillScores.forEach(s => {
  console.log(`  [${s.score}] ${s.category}: ${s.hits.join(', ') || 'no direct matches'}`);
});

console.log('\n--- Bullet relevance per role ---');
scored.forEach(exp => {
  console.log(`\n  ${exp.company} | ${exp.role}`);
  exp.bullets.forEach(b => {
    console.log(`    [${b.score}] #${b.idx}: ${b.text}...`);
  });
});

const overlayName = path.basename(jdPath, path.extname(jdPath)) + '-overlay.yml';
console.log(`\n=== NEXT STEP ===`);
console.log(`Ask Claude Code: "Generate overlay for ${jdPath}"`);
console.log(`It will write: jobs/${overlayName}`);
console.log(`Then run: npm run build -- --overlay jobs/${overlayName}`);
