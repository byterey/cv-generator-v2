# CV Generator

An ATS-friendly CV/resume generator that renders structured YAML data into HTML and PDF.

**One rendering pipeline.** Templates control presentation only — data and layout are strictly separated. HTML is the canonical output; PDF is derived from that HTML via headless browser.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and edit the sample CV with your own information
cp sample-data/cv.yml cv.yml

# 3. Build your CV
npm run build
```

Output: `output/cv.html` and `output/cv.pdf` (ATS-compatible — all text is selectable, single-column layout, semantic HTML).

## How It Works

```
cv.yml (your data)
  + optional overlay.yml (job-specific tailoring)
  --> src/generate.js
    --> templates/default.html (Handlebars)
      --> output/cv.html (ATS-optimized)
        --> output/cv.pdf (Puppeteer → A4)
```

## Project Structure

```
cv-generator/
  src/
    generate.js     # Main build script — reads YAML, renders HTML, generates PDF
    tailor.js       # Keyword analysis tool — scores CV content against a job description
  templates/
    default.html    # Handlebars HTML template (ATS-compliant, single-column)
  scripts/
    sync-agent-files.js  # Optional — syncs CLAUDE.md/AGENTS.md from MASTER.md
  sample-data/
    cv.yml          # Sample CV with placeholder data — use as a starting point
    sample-job-description.txt   # Example job description for testing tailor.js
    sample-overlay.yml           # Example overlay showing how to tailor a CV
  package.json
  LICENSE           # MIT
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Generate CV from default data (`sample-data/cv.yml`) |
| `npm run build -- --data cv.yml` | Generate CV from your own data file |
| `npm run build -- --overlay jobs/myjd-overlay.yml` | Build with a job-specific overlay |
| `npm run build -- --html-only` | Generate HTML only (skip PDF) |
| `npm run tailor sample-data/sample-job-description.txt` | Score CV against a JD |
| `npm run tailor my-jd.txt --data cv.yml` | Score your CV against a JD |

## Data Model

Your CV is defined in a single YAML file. Every section is an ordered array. Dates are structured `{ year, month }` — never free text.

```
CV
  meta.sections[]       # ordered, togglable section keys
  personal              # name, headline, email, phone, location, links[], summary
  experience[]          # company, role, location, start/end dates, bullets[]
  education[]           # institution, degree, field, dates
  skills[]              # category + items[] (plain strings)
  certifications[]      # title, issuer, date
  projects[]            # name, description, stack[], url, dates
```

Bullet points use **markdown**. Skill items and stack tags are plain strings. Templates own all formatting decisions.

## Tailoring for a Job

1. Run `npm run tailor <job-description.txt>` to score your CV against the JD
2. Create an overlay YAML file with your customizations
3. Run `npm run build -- --overlay <your-overlay.yml>`

### Overlay Capabilities

An overlay modifies the base CV at render time — it never changes your master data:

- Change the headline and summary
- Reorder sections and skill categories
- Reorder bullets within each role
- Rephrase bullets to adopt JD terminology
- Exclude skills, certifications, education entries, or experience

See `sample-data/sample-overlay.yml` for a complete example.

## ATS Compatibility

All templates must pass ATS parsing. Key rules:

- All content is real DOM text (no images, SVG, or canvas for text)
- Single-column layout only (ATS reads left-to-right, not multi-column)
- Semantic HTML: `<h1>` for name, `<h2>` for section headers, `<time>` for dates
- PDF generated via browser print-to-PDF (selectable text, not rasterized)
- No non-ASCII punctuation

## Adding Your Own Template

1. Copy `templates/default.html` and modify the HTML/CSS
2. Point the build at your template:
   ```bash
   npm run build -- --template templates/my-theme.html
   ```
3. Your template receives the full CV data object and owns all formatting

## Requirements

- Node.js 18+
- Puppeteer (installed automatically as a dependency — downloads Chromium)

## License

MIT — see [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on pull requests, coding conventions, and the contributor license agreement.