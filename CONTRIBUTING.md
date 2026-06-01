# Contributing to now-cv

Thanks for your interest in contributing.

## Repository structure

```
/               CLI tool (Node.js, Handlebars, Puppeteer)
/web            Next.js 14 web application
/templates      Handlebars CV templates (shared by CLI and web)
/tasks          Project planning docs (not tracked as issues)
/.github        PR/issue templates, workflows
```

## Getting started

**CLI tool**
```bash
npm install
npm run build          # generates output/cv.html + output/cv.pdf
```

**Web app**
```bash
cd web
npm install
cp .env.example .env.local   # fill in Supabase + Azure AI keys
npm run dev                  # http://localhost:3000
```

See `web/.env.example` for all required environment variables.
The Supabase schema is in `web/supabase/schema.sql` — run it in the
Supabase SQL editor before starting the app.

## Branch and merge policy

| Branch pattern | Purpose |
|---|---|
| `main` | Protected. Production-ready code only. |
| `feat/*` | Human feature branches |
| `fix/*` | Bug fixes |
| `claude/*` | AI-assisted development branches |

**All merges to `main` must go through a PR and use squash-merge.**
Squash-merge collapses the branch's commit history into one clean
commit whose message is the PR title. Write PR titles in the
imperative under 72 chars: `feat: add PDF download button`.

Direct pushes to `main` are blocked by branch protection.

## Commit messages

Use conventional commits: `<type>(<scope>): <summary>`

Types: `feat` | `fix` | `refactor` | `docs` | `chore` | `test` | `perf`

To use the commit template locally:
```bash
git config commit.template .github/commit_message_template.txt
```

**Do not include** in commit messages or PR bodies:
- AI session URLs (`claude.ai/code/session_...`)
- Internal planning notes or task IDs
- `.env` values, API keys, or credentials
- Personal CV data or job description content

## Pull request guidelines

- One concern per PR — reviewers should be able to understand the
  change without switching context
- Fill in the PR template completely — especially the security checklist
- The PR title becomes the squash-merge commit message on `main`
- Tag the relevant area in the PR template checklist

## Coding conventions

**General**
- ES modules (`import`/`export`), not CommonJS
- TypeScript in `/web`, plain JS in `/` (CLI tool)
- No new runtime dependencies without discussion

**Web app (`/web`)**
- Next.js App Router — server components by default, `'use client'`
  only when interactivity requires it
- Tailwind for all styling — no custom CSS files
- Supabase RLS enforced on all tables — never bypass with service role
  from the client
- AI credit deductions must go through the `deduct_credit` Supabase RPC
  (atomic) — never decrement directly from application code

**CLI tool (`/`)**
- ATS compatibility is non-negotiable — output must be selectable text,
  single-column, correct heading hierarchy
- CSS stays inline in the template — no external stylesheets
- No external CDN dependencies in templates

**ATS rules (both CLI and web)**
- All CV content must be real DOM text — no images, SVG, or canvas
- Single-column layout only
- `<h1>` for name, `<h2>` for section headers, `<time>` for dates
- PDF via headless browser print-to-PDF — selectable text required
- No non-ASCII punctuation (use `"` not `"`, `-` not `—`)

## Security

- Report vulnerabilities privately via
  [GitHub Security Advisories](https://github.com/byterey/now-cv/security/advisories/new)
- Do **not** open public issues for security bugs
- Never commit real credentials, even in tests — use `.env.local`
  (gitignored) or GitHub Actions secrets

## Branch protection setup (repo owner)

Branch protection for `main` must be configured manually in GitHub:

> Settings → Branches → Add rule → Branch name pattern: `main`

Recommended settings:
- [x] Require a pull request before merging
- [x] Require approvals: 1 (or 0 for solo work — still enforces PR flow)
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass (add build check once CI is wired up)
- [x] Require branches to be up to date before merging
- [x] Do not allow bypassing the above settings

## Code of Conduct

Be respectful. Assume good intent. Focus on the work.