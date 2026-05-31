# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project does

now-cv renders a structured YAML file (`cv.yml`) into an ATS-friendly HTML and PDF CV via Handlebars and Puppeteer. There is one rendering pipeline: HTML is canonical, PDF is derived from it. Templates control presentation only — data and layout are strictly separated.

## User profile

The user's CV data lives in `cv.yml` at the project root. This is the source of truth for all screening and generation. Read it before doing anything JD-related.

## Workflow — HARD RULE

### When the user pastes or references a job description

**Do not generate anything yet.** Screen first, always.

**Step 1 — Screen the JD against `cv.yml`**

Rate the fit as one of three tiers:

| Tier | Score | Action |
|---|---|---|
| **A — Strong fit** | 70%+ | Proceed to generate |
| **B — Reachable** | 50–69% | Flag gaps, ask user to confirm before generating |
| **C — Long shot** | Below 50% | Explain why; do not generate unless user explicitly says to proceed |

Screen across four dimensions:
1. **Hard requirements** — years of experience, must-have tools/stack stated in JD. Missing any is a fast kill.
2. **Stack overlap** — how many core tech items from the JD appear in `cv.yml`
3. **Role title alignment** — does the user's career arc match the role type
4. **Seniority match** — over or under-qualified in a way that triggers automatic filtering

Report: Tier, score, what matches, what's missing, what's fixable vs structural. For Tier B, state what gaps are closable before asking to proceed. For Tier C, do not generate unless the user explicitly overrides.

---

### Evaluation lenses — apply all three simultaneously

#### Lens 1: ATS Filter
Simulate how an ATS scans the CV before a human sees it.

- **Keyword match** — does `cv.yml` contain the exact terms from the JD? ATS matches strings, not intent. Flag missing exact keywords.
- **Job title match** — does the candidate's title closely match the JD title?
- **Hard filter triggers** — citizenship requirements, clearance levels, visa restrictions, mandatory certifications. If a hard filter is present and the user fails it, auto-disqualify — do not generate, do not ask to confirm.
- **Skills section coverage** — flag any JD keywords absent from the skills section even if present elsewhere.
- **Years of experience** — flag if below the stated minimum.

#### Lens 2: Recruiter Screen
Simulate a recruiter doing a 6–10 second initial pass.

- **6-second scan** — Is the most recent title immediately recognisable as relevant? Is total years of experience visible without calculation?
- **Tenure red flags** — Any role under 12 months triggers scrutiny. Multiple short stints in a row is a pattern disqualifier.
- **Career gaps** — Flag any gap over 3 months.
- **Action verb density** — Do bullets lead with strong ownership verbs? Flag passive openers: "was responsible for", "helped with", "supported", "participated in".
- **Achievement density** — What percentage of bullets have a quantified or scaled outcome? Below 50% reads as a task list.
- **Credibility signals** — Well-known companies and notable certifications increase confidence to forward.

#### Lens 3: Hiring Manager View
Simulate how a senior hiring manager reads the shortlisted CV.

- **Career trajectory** — does the arc tell a coherent story leading to this role?
- **Domain credibility** — does the candidate have industry/domain experience matching the role's environment?
- **Leadership signal** — for senior/lead roles, is team leadership explicit and recent?
- **Impact over activity** — outcomes ("reduced X by Y%") not tasks ("responsible for X"). Flag activity-only bullets.
- **Narrative consistency** — does the summary/headline match the experience?
- **Sponsorship risk** — flag if the JD shows preference for locals or if the company is unlikely to sponsor.

---

### Report structure — use this exact format every time

**1. ATS Scan**
| Check | Result |
|---|---|
| Hard filters (citizenship, clearance, visa) | Pass / FAIL — reason |
| Title match | Exact / Close / Weak |
| Keywords matched | list exact terms found in cv.yml |
| Keywords missing | list exact JD terms absent from cv.yml |
| Years of experience | Meets / Below minimum |
| Certifications required | Met / Missing |

**2. Recruiter Screen**
| Signal | Assessment |
|---|---|
| 6-second scan | Passes / Fails — reason |
| Tenure red flags | None / Flag — detail |
| Career gaps | None / Flag — period |
| Action verb density | Strong / Weak — list passive openers found |
| Achievement density | X of Y bullets outcome-driven (N%) |
| Credibility signals | Strong / Weak |
| Presentation readiness | Forward-ready / Needs work — reason |

**3. Hiring Manager View**
| Signal | Assessment |
|---|---|
| Career trajectory | Coherent / Needs explanation |
| Domain credibility | Strong / Partial / None |
| Leadership signal | Present / Absent |
| Impact in bullets | Outcome-driven / Activity-only |
| Narrative consistency | Aligned / Mismatched |
| Sponsorship risk | Low / Medium / High |

**4. Strengths** — what works in the user's favour (max 5, most compelling first)

**5. Gaps** — split into:
- **Structural** — hard to fix (wrong domain, wrong citizenship, career arc mismatch)
- **Fixable** — can be addressed in CV or cover letter (missing keyword, unlisted skill, weak bullet)

**6. Suggestions** — concrete actions ranked by impact

**7. Verdict** — Tier A / B / C with one-sentence rationale

---

**Step 2 — Generate the CV (only after screen passes or user confirms)**

1. Save the JD as `jobs/<company-role>.txt` if not already saved.
2. Run keyword analysis: `node src/tailor.js jobs/<jd-file>.txt --data cv.yml`
3. Write overlay file at `jobs/<jd-stem>-overlay.yml`:
   - Reorder sections and skill categories by JD relevance
   - Reorder bullets within each role by relevance (highest first)
   - Rephrase bullets only to adopt the JD's exact terminology where the fact is identical — never add claims
   - Write a tailored `headline` and `summary` using JD language, same facts
   - Never claim more ownership, scope, or depth than what is in `cv.yml`

   **Bullet quality gate — apply to every bullet:**
   Required: `[Strong action verb] + [what was done] + [quantified result or scale]`
   - Weak openers to replace: "supported", "helped", "assisted", "worked with", "used", "participated in", "was responsible for"
   - Strong openers: Led, Built, Drove, Reduced, Delivered, Designed, Established, Automated, Migrated, Secured, Deployed, Implemented
   - If a bullet cannot pass without adding claims not in `cv.yml`, keep it as-is and flag it: `# WEAK — no factual outcome; rephrase only if user confirms metric`
   - Target: at least 60% of included bullets must have a measurable result or scale

4. Build: `npm run build -- --data cv.yml --overlay jobs/<jd-stem>-overlay.yml`
5. Report output paths: `output/cv.html` and `output/cv.pdf`

## ATS rules — non-negotiable

- All content must be real DOM text. No text in images, SVG, or canvas.
- Single-column layout only. No multi-column for CV content.
- `<h1>` for name, `<h2>` for section headers, `<time>` for dates.
- PDF via headless browser print-to-PDF only — selectable text required.
- No non-ASCII punctuation: use `"` not `"`, `-` not `—`.
