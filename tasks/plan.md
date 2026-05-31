# Implementation Plan: now-cv Web App

## Overview

Convert now-cv from a CLI tool into a full-stack web application. Non-technical users fill in a guided multi-step form, paste a job description, get an AI-powered screening report, and download a tailored PDF — all in the browser. Google sign-in gates access. A monthly credit cap controls AI usage costs.

## Architecture Decisions

- **Next.js 14 App Router** — handles UI and API routes in one project; no separate backend service needed
- **Supabase** — Google OAuth + PostgreSQL in one service; free tier covers this scale
- **Azure AI Foundry** — GPT-4o for CV generation, DeepSeek for JD screening; model assignments driven by env vars via `ai.config.js` so the owner can swap without touching code
- **Puppeteer stays server-side** — PDF generation runs in a Next.js API route; existing `templates/default.html` and overlay logic from `src/generate.js` are reused as-is
- **Credits deducted only on AI actions** — editing, saving, previewing, and downloading are always free
- **Azure Web App Service** for hosting — avoids Vercel's 10s timeout and 50MB Puppeteer bundle limit

## Dependency Graph

```
[T1] Project scaffold (Next.js + Tailwind)
  └── [T2] Supabase schema + env vars
        ├── [T3] Google OAuth sign-in flow
        │     └── [T4] Auth middleware (protected routes)
        │           ├── [T5] Dashboard
        │           │     └── [T6–T10] CV form wizard + save/load
        │           │           ├── [T11–T13] PDF preview + download
        │           │           ├── [T14] AI config + Azure client
        │           │           │     ├── [T15–T16] JD analysis flow
        │           │           │     └── [T17–T18] CV generation flow
        │           │           └── [T19–T21] Credits system
        └── [T22] Landing page
              └── [T23–T24] CI/CD + Azure deployment
```

---

## Phase 1: Foundation

### Task 1: Scaffold Next.js 14 project with Tailwind

**Description:** Initialise a new Next.js 14 App Router project inside `web/` subdirectory of the repo. Configure Tailwind, set up folder structure, copy existing Handlebars template and generate.js logic into the new project.

**Acceptance criteria:**
- [ ] `web/` directory exists with a working Next.js 14 App Router project
- [ ] Tailwind CSS configured and rendering correctly on a test page
- [ ] `web/templates/default.html` copied from `templates/default.html`
- [ ] Core overlay + sanitize logic extracted from `src/generate.js` into `web/lib/cv-engine.js` as pure functions (no filesystem reads)
- [ ] `npm run dev` starts without errors

**Verification:**
- [ ] `cd web && npm run dev` → localhost:3000 shows Next.js default page
- [ ] Tailwind class renders correctly (add a test div with `bg-blue-500`)

**Dependencies:** None

**Files likely touched:**
- `web/` (new directory)
- `web/app/layout.tsx`, `web/app/page.tsx`
- `web/lib/cv-engine.js`
- `web/templates/default.html`

**Estimated scope:** M

---

### Task 2: Supabase project setup + database schema

**Description:** Create Supabase project, enable Google OAuth provider, and create all three database tables. Store connection strings in `.env.local`.

**Acceptance criteria:**
- [ ] Supabase project created with Google OAuth enabled
- [ ] `cvs` table created: `id uuid PK, user_id uuid, name text, data jsonb, created_at timestamptz, updated_at timestamptz`
- [ ] `user_credits` table created: `user_id uuid PK, credits_remaining int default 5, credits_used_total int default 0, reset_at timestamptz`
- [ ] `usage_logs` table created: `id uuid PK, user_id uuid, action text, tokens_used int, created_at timestamptz`
- [ ] Row Level Security (RLS) enabled on all tables — users can only read/write their own rows
- [ ] `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `.env.example` updated with placeholder keys

**Verification:**
- [ ] Connect to Supabase dashboard and confirm tables exist with correct columns
- [ ] RLS policies visible in Supabase dashboard for each table

**Dependencies:** Task 1

**Files likely touched:**
- `web/.env.local` (gitignored)
- `web/.env.example`
- Supabase dashboard (SQL editor)

**Estimated scope:** S

---

### Task 3: Google sign-in flow

**Description:** Implement the complete Google OAuth sign-in flow using Supabase Auth. Sign-in page with Google button, OAuth callback handler, session management via Supabase SSR helpers.

**Acceptance criteria:**
- [ ] `/signin` page renders with a "Sign in with Google" button
- [ ] Clicking the button redirects to Google OAuth consent screen
- [ ] After Google consent, user is redirected back and a Supabase session is established
- [ ] User's name and avatar from Google are accessible in the session
- [ ] Sign-out button clears session and redirects to `/signin`

**Verification:**
- [ ] Manual: click "Sign in with Google" → complete OAuth → land on `/dashboard` as authenticated user
- [ ] Manual: click sign-out → redirected to `/signin`, session cleared

**Dependencies:** Task 2

**Files likely touched:**
- `web/app/signin/page.tsx`
- `web/app/auth/callback/route.ts`
- `web/lib/supabase/client.ts`, `web/lib/supabase/server.ts`

**Estimated scope:** M

---

### Task 4: Auth middleware — protect routes

**Description:** Next.js middleware that redirects unauthenticated users to `/signin` for all routes except `/`, `/signin`, and `/auth/callback`.

**Acceptance criteria:**
- [ ] Visiting `/dashboard` without a session redirects to `/signin`
- [ ] Visiting `/dashboard` with a valid session renders the page
- [ ] Public routes (`/`, `/signin`, `/auth/callback`) are accessible without auth

**Verification:**
- [ ] Open incognito → visit `/dashboard` → redirected to `/signin`
- [ ] Sign in → visit `/dashboard` → renders correctly

**Dependencies:** Task 3

**Files likely touched:**
- `web/middleware.ts`

**Estimated scope:** S

---

### ✅ Checkpoint 1 — Foundation
- [ ] `npm run dev` starts without errors
- [ ] Google sign-in works end-to-end
- [ ] Protected routes redirect correctly
- [ ] **Human review before proceeding**

---

## Phase 2: CV Builder

### Task 5: Dashboard page

**Description:** The main page after sign-in. Lists all saved CVs for the user with name, last updated date. "New CV" button. "Edit" and "Delete" actions per CV. Shows credit balance in the header.

**Acceptance criteria:**
- [ ] `/dashboard` lists all CVs for the signed-in user (fetched from `cvs` table)
- [ ] Each CV card shows name and last updated date
- [ ] "New CV" button navigates to `/cv/new`
- [ ] "Edit" link navigates to `/cv/[id]`
- [ ] "Delete" removes the CV after confirmation prompt
- [ ] Credit balance (`credits_remaining / 5`) visible in page header
- [ ] Empty state shown when user has no CVs yet

**Verification:**
- [ ] Sign in → dashboard shows empty state
- [ ] Create a CV → dashboard shows it
- [ ] Delete it → returns to empty state

**Dependencies:** Task 4

**Files likely touched:**
- `web/app/dashboard/page.tsx`
- `web/components/CvCard.tsx`
- `web/components/CreditBadge.tsx`
- `web/lib/supabase/cvs.ts`

**Estimated scope:** M

---

### Task 6: CV form wizard — Personal info step

**Description:** First step of the multi-step CV creation wizard. Fields: full name, headline, email, phone, location, LinkedIn URL, GitHub URL, summary (textarea). Progress indicator showing current step.

**Acceptance criteria:**
- [ ] `/cv/new` renders Step 1 with all personal info fields
- [ ] Progress bar shows Step 1 of 6
- [ ] Required fields (name, email) validated before "Next" is enabled
- [ ] Form state persisted in React state (not yet saved to DB)
- [ ] "Next" advances to Step 2

**Verification:**
- [ ] Fill in all fields → click Next → Step 2 renders
- [ ] Clear required field → Next button disabled

**Dependencies:** Task 5

**Files likely touched:**
- `web/app/cv/new/page.tsx`
- `web/components/wizard/StepPersonal.tsx`
- `web/components/wizard/WizardProgress.tsx`

**Estimated scope:** M

---

### Task 7: CV form wizard — Experience step

**Description:** Step 2. Dynamic list of work experience entries. Each entry: company, role, location, start date (month/year), end date or "current" checkbox, bullet points (add/remove). Entries can be added, removed, and reordered.

**Acceptance criteria:**
- [ ] At least one experience entry required
- [ ] "Add role" button appends a new blank entry
- [ ] "Remove" button deletes an entry (with confirmation if it has data)
- [ ] "Current role" checkbox hides the end date fields
- [ ] Bullet points: textarea per bullet, "Add bullet" and "Remove" buttons
- [ ] At least one bullet required per entry

**Verification:**
- [ ] Add 2 entries with bullets → both persist in form state when navigating back
- [ ] Check "current role" → end date fields disappear

**Dependencies:** Task 6

**Files likely touched:**
- `web/components/wizard/StepExperience.tsx`
- `web/components/wizard/ExperienceEntry.tsx`

**Estimated scope:** L

---

### Task 8: CV form wizard — Education and Skills steps

**Description:** Step 3 (Education): institution, degree, field, end year. Multiple entries supported. Step 4 (Skills): categorised skill tags. User types a category name and adds skill items as tags (chip-style input). Multiple categories supported.

**Acceptance criteria:**
- [ ] Education: add/remove entries, all fields captured
- [ ] Skills: add/remove categories, add/remove individual skill items within each category
- [ ] Skill items render as removable chips/tags
- [ ] At least one skill category required

**Verification:**
- [ ] Add 2 education entries → both show on review step
- [ ] Add "DevOps" category with 3 skills → chips render correctly, removable

**Dependencies:** Task 7

**Files likely touched:**
- `web/components/wizard/StepEducation.tsx`
- `web/components/wizard/StepSkills.tsx`
- `web/components/ui/TagInput.tsx`

**Estimated scope:** M

---

### Task 9: CV form wizard — Certifications, Projects, and Review steps

**Description:** Step 5 (Certifications): title, issuer, date, optional note. Step 6 (Projects): name, description, stack tags, URL. Final Review step: read-only summary of all entered data before saving.

**Acceptance criteria:**
- [ ] Certifications and projects are optional (can skip)
- [ ] Review step displays all entered data in a structured summary
- [ ] "Back" navigation works from any step without losing data
- [ ] "Save CV" button on review step

**Verification:**
- [ ] Navigate forward through all 6 steps → review step shows all entered data
- [ ] Navigate back from step 6 to step 1 → all data intact

**Dependencies:** Task 8

**Files likely touched:**
- `web/components/wizard/StepCertifications.tsx`
- `web/components/wizard/StepProjects.tsx`
- `web/components/wizard/StepReview.tsx`

**Estimated scope:** M

---

### Task 10: Save and load CV data

**Description:** Wire the "Save CV" button to insert/update the `cvs` table in Supabase. Load existing CV data when editing (`/cv/[id]`). CV name defaults to "My CV" with option to rename.

**Acceptance criteria:**
- [ ] "Save CV" on review step inserts a new row in `cvs` with correct JSONB structure
- [ ] After save, user is redirected to `/cv/[id]`
- [ ] `/cv/[id]` loads the CV data and populates all wizard steps
- [ ] "Rename" inline edit updates the `name` field
- [ ] `updated_at` is updated on every save

**Verification:**
- [ ] Create CV → saved → refresh page → all data still there
- [ ] Edit experience bullet → save → reload → change persisted

**Dependencies:** Task 9

**Files likely touched:**
- `web/lib/supabase/cvs.ts`
- `web/app/cv/[id]/page.tsx`
- `web/app/api/cvs/route.ts`

**Estimated scope:** M

---

### ✅ Checkpoint 2 — CV Builder
- [ ] Full wizard flow works: create, edit, save, reload
- [ ] Multiple CVs visible on dashboard
- [ ] Delete works
- [ ] **Human review before proceeding**

---

## Phase 3: PDF Generation

### Task 11: PDF generation API route

**Description:** Port the Puppeteer + Handlebars pipeline from `src/generate.js` into a Next.js API route `POST /api/generate-pdf`. Accepts CV data JSON in the request body, returns the PDF as a binary stream. Uses `page.setContent()` instead of `file://` protocol.

**Acceptance criteria:**
- [ ] `POST /api/generate-pdf` accepts `{ cvData, overlayData? }` JSON body
- [ ] Returns `Content-Type: application/pdf` with correct binary content
- [ ] Overlay logic applied if `overlayData` provided (reuses extracted `cv-engine.js`)
- [ ] Handlebars template renders correctly
- [ ] Non-ASCII punctuation sanitized (reuses `sanitizeDeep` from `cv-engine.js`)
- [ ] Puppeteer launches with `--no-sandbox` flag (required for Azure Web App / Linux containers)

**Verification:**
- [ ] `curl -X POST /api/generate-pdf -d '{"cvData": {...}}' --output test.pdf` → valid PDF opens in viewer
- [ ] PDF text is selectable (not rasterized)

**Dependencies:** Task 2

**Files likely touched:**
- `web/app/api/generate-pdf/route.ts`
- `web/lib/cv-engine.js` (already created in T1)

**Estimated scope:** M

---

### Task 12: CV preview page

**Description:** `/cv/[id]/preview` renders the CV as HTML in an iframe for in-browser review. "Download PDF" button triggers the API route. "Edit" button returns to the wizard.

**Acceptance criteria:**
- [ ] `/cv/[id]/preview` renders the CV HTML in a full-width iframe
- [ ] CV data loaded from Supabase for the authenticated user
- [ ] "Download PDF" button calls `/api/generate-pdf` and triggers browser download
- [ ] PDF filename defaults to `[cv-name].pdf`
- [ ] Loading spinner shown while PDF is generating

**Verification:**
- [ ] Open preview → CV renders correctly in iframe
- [ ] Click "Download PDF" → file downloads with correct name
- [ ] Open downloaded PDF → text is selectable

**Dependencies:** Task 11

**Files likely touched:**
- `web/app/cv/[id]/preview/page.tsx`
- `web/components/PdfDownloadButton.tsx`

**Estimated scope:** M

---

### ✅ Checkpoint 3 — PDF Pipeline
- [ ] Preview renders CV correctly
- [ ] PDF downloads and opens correctly
- [ ] Text in PDF is selectable (ATS-safe)
- [ ] **Human review before proceeding**

---

## Phase 4: AI Integration

### Task 13: AI config and Azure AI Foundry client

**Description:** Create `web/lib/ai/ai.config.js` mapping tasks to models via env vars. Create `web/lib/ai/foundry-client.js` wrapping the Azure AI Foundry SDK. Both models (GPT-4o and DeepSeek) configured and callable.

**Acceptance criteria:**
- [ ] `ai.config.js` reads `MODEL_JD_SCREENING` and `MODEL_CV_GENERATION` from env (defaults to `deepseek` and `gpt-4o`)
- [ ] `MODEL_REGISTRY` maps model names to Azure deployment names from env vars
- [ ] `foundry-client.js` exports a `chat(model, messages)` function that routes to the correct deployment
- [ ] `.env.example` updated with all Azure AI Foundry vars: `AZURE_AI_ENDPOINT`, `AZURE_AI_KEY`, `AZURE_GPT4O_DEPLOYMENT`, `AZURE_DEEPSEEK_DEPLOYMENT`
- [ ] Swapping `MODEL_JD_SCREENING=gpt-4o` in `.env.local` routes to GPT-4o without code changes

**Verification:**
- [ ] Unit test: `chat('deepseek', [{role:'user', content:'Say hello'}])` returns a response
- [ ] Change `MODEL_JD_SCREENING` → confirm different deployment used (log the deployment name)

**Dependencies:** Task 2

**Files likely touched:**
- `web/lib/ai/ai.config.js`
- `web/lib/ai/foundry-client.js`
- `web/.env.example`

**Estimated scope:** S

---

### Task 14: JD analysis API route + credit check

**Description:** `POST /api/analyze-jd` — accepts CV data + JD text, checks user has credits, calls DeepSeek via AI Foundry, returns structured screening report (Tier, ATS scan, recruiter screen, hiring manager view). Deducts 1 credit on success.

**Acceptance criteria:**
- [ ] Returns `402` with reset date if user has 0 credits
- [ ] Sends CV data + JD to DeepSeek with the full screening prompt (3 lenses + structured tables)
- [ ] Returns structured JSON: `{ tier, ats, recruiter, hiringManager, strengths, gaps, suggestions, verdict }`
- [ ] On success: inserts row into `usage_logs`, decrements `user_credits.credits_remaining` by 1
- [ ] Credit deduction is atomic (use Supabase transaction or RPC)

**Verification:**
- [ ] Call with valid CV + JD → returns Tier A/B/C report
- [ ] Call with 0 credits → returns 402 with `reset_at` date
- [ ] After successful call: `credits_remaining` decremented in DB, row in `usage_logs`

**Dependencies:** Task 13, Task 10

**Files likely touched:**
- `web/app/api/analyze-jd/route.ts`
- `web/lib/ai/prompts/jd-screening.js`
- `web/lib/credits.ts`

**Estimated scope:** M

---

### Task 15: JD analysis UI

**Description:** `/cv/[id]/analyze` — textarea for pasting the JD, "Analyze" button, results panel showing the full structured report with Tier badge, tables, strengths/gaps/suggestions.

**Acceptance criteria:**
- [ ] JD textarea with placeholder text and character counter
- [ ] "Analyze" button disabled if JD is empty or user has 0 credits
- [ ] Loading state shown while AI processes (spinner + "Analyzing your CV against this role...")
- [ ] Results rendered as structured sections: Tier badge (colour-coded A/B/C), ATS table, Recruiter table, Hiring Manager table, Strengths list, Gaps (structural vs fixable), Suggestions, Verdict
- [ ] Credit balance updates immediately after successful analysis
- [ ] Out-of-credits state: friendly message with reset date, no error toast

**Verification:**
- [ ] Paste JD → click Analyze → loading state shows → results render
- [ ] Tier A → green badge; Tier B → amber; Tier C → red
- [ ] Credit count decrements in header after analysis

**Dependencies:** Task 14

**Files likely touched:**
- `web/app/cv/[id]/analyze/page.tsx`
- `web/components/analysis/TierBadge.tsx`
- `web/components/analysis/ScreeningReport.tsx`
- `web/components/analysis/OutOfCredits.tsx`

**Estimated scope:** L

---

### Task 16: CV generation API route + credit check

**Description:** `POST /api/generate-cv` — accepts CV data + JD text, checks credits, calls GPT-4o to generate an overlay JSON (tailored headline, summary, reordered bullets), applies overlay, returns the rendered HTML and overlay data. Deducts 1 credit.

**Acceptance criteria:**
- [ ] Returns `402` if 0 credits
- [ ] GPT-4o prompt instructs: reorder bullets by JD relevance, rephrase only to match JD terminology (no fabrication), write tailored headline + summary
- [ ] Returns `{ overlayData, html }` — overlay JSON and rendered HTML
- [ ] Overlay applied via existing `applyOverlay()` from `cv-engine.js`
- [ ] 1 credit deducted, usage logged

**Verification:**
- [ ] Call with CV + JD → returns overlay JSON with `headline`, `summary`, `experience` array
- [ ] Apply overlay via `cv-engine.js` → HTML renders with tailored content
- [ ] Credits decremented

**Dependencies:** Task 13, Task 14 (credit logic reuse)

**Files likely touched:**
- `web/app/api/generate-cv/route.ts`
- `web/lib/ai/prompts/cv-generation.js`

**Estimated scope:** M

---

### Task 17: CV generation UI

**Description:** "Generate tailored CV" button on the analyze page (shown after a Tier A or B result). Triggers generation, shows diff of what changed (headline, summary, reordered bullets). "Download tailored PDF" button.

**Acceptance criteria:**
- [ ] "Generate tailored CV" button visible after Tier A or B result (not shown for Tier C without explicit override)
- [ ] Loading state while GPT-4o generates
- [ ] Results show: new headline, new summary, which bullets were reordered or rephrased
- [ ] "Download tailored PDF" triggers `/api/generate-pdf` with overlay data
- [ ] "Save as new CV" option saves the tailored version as a new row in `cvs`
- [ ] Credit balance updated after generation

**Verification:**
- [ ] Tier A result → click "Generate" → loading → tailored content shown
- [ ] "Download tailored PDF" → PDF downloads with tailored content
- [ ] Credits decremented

**Dependencies:** Task 16, Task 15

**Files likely touched:**
- `web/app/cv/[id]/analyze/page.tsx` (extend)
- `web/components/analysis/TailoredResult.tsx`

**Estimated scope:** M

---

### ✅ Checkpoint 4 — AI Integration
- [ ] JD analysis returns accurate Tier A/B/C report
- [ ] CV generation produces sensible overlay
- [ ] Credits deduct correctly
- [ ] Swap `MODEL_JD_SCREENING` env var → different model used
- [ ] **Human review before proceeding**

---

## Phase 5: Credits System

### Task 18: Credit initialisation and monthly reset

**Description:** When a user signs in for the first time, insert a row into `user_credits` with `credits_remaining = 5` and `reset_at = first day of next month`. A server-side function checks on each request if `reset_at` has passed and resets credits.

**Acceptance criteria:**
- [ ] New user: `user_credits` row created automatically on first sign-in (Supabase trigger or API middleware)
- [ ] `reset_at` set to `YYYY-MM-01 00:00:00 UTC` of the next calendar month
- [ ] On each authenticated API request: if `now() > reset_at`, reset `credits_remaining = 5` and set next `reset_at`
- [ ] Reset is idempotent (no double-reset if called multiple times in the same second)

**Verification:**
- [ ] New user signs in → row in `user_credits` with `credits_remaining = 5`
- [ ] Manually set `reset_at` to 1 minute in the past → make any API call → credits reset to 5

**Dependencies:** Task 3

**Files likely touched:**
- `web/lib/credits.ts` (extend)
- Supabase trigger or `web/app/api/auth/callback/route.ts`

**Estimated scope:** S

---

### Task 19: Credit display and out-of-credits UX

**Description:** Credit badge in the app header shows `X / 5 credits remaining` with a tooltip showing reset date. Out-of-credits state on analysis and generation pages shows a clear, friendly message — not an error.

**Acceptance criteria:**
- [ ] Header badge: `3 / 5 credits` — updates in real time after each AI action
- [ ] Tooltip on badge: "Resets on June 1, 2026"
- [ ] When `credits_remaining = 0`: Analyze and Generate buttons disabled with tooltip "Out of credits. Resets on [date]"
- [ ] Full-page out-of-credits message if user navigates to analyze with 0 credits
- [ ] Message tone: "You've used your 5 free AI credits for this month. Come back on [date] for more." — no paywall framing

**Verification:**
- [ ] Use all 5 credits → badge shows `0 / 5`, buttons disabled
- [ ] Out-of-credits page message shows correct reset date

**Dependencies:** Task 18, Task 15

**Files likely touched:**
- `web/components/CreditBadge.tsx` (extend from T5)
- `web/components/analysis/OutOfCredits.tsx` (extend from T15)

**Estimated scope:** S

---

### ✅ Checkpoint 5 — Credits
- [ ] New user gets 5 credits
- [ ] Credits deduct correctly on AI actions
- [ ] Reset logic works (manual test with backdated `reset_at`)
- [ ] Out-of-credits UX is friendly, not a hard block
- [ ] **Human review before proceeding**

---

## Phase 6: Landing Page + Deployment

### Task 20: Landing page

**Description:** `/` public page. Explains what now-cv does, who it's for, and how it works. "Sign in with Google" CTA. Lists key features. Branding — this is a marketing tool.

**Acceptance criteria:**
- [ ] Hero section: headline, subheadline, "Sign in with Google" CTA
- [ ] Features section: CV builder, JD analysis, tailored PDF
- [ ] "5 free AI credits/month" callout
- [ ] Responsive (mobile + desktop)
- [ ] Signed-in users visiting `/` are redirected to `/dashboard`

**Verification:**
- [ ] Open in mobile viewport → layout intact
- [ ] Signed-in → visiting `/` redirects to `/dashboard`

**Dependencies:** Task 4

**Files likely touched:**
- `web/app/page.tsx`
- `web/components/landing/Hero.tsx`
- `web/components/landing/Features.tsx`

**Estimated scope:** M

---

### Task 21: GitHub Actions → Azure Web App CI/CD

**Description:** GitHub Actions workflow that builds the Next.js app and deploys to Azure Web App on every push to `main`. Puppeteer system dependencies installed in the Azure Web App startup command.

**Acceptance criteria:**
- [ ] `.github/workflows/deploy-web.yml` exists
- [ ] Workflow triggers on push to `main` for changes in `web/**`
- [ ] Build step: `cd web && npm ci && npm run build`
- [ ] Deploy step: Azure Web Apps Deploy action with publish profile secret
- [ ] Azure Web App startup command installs Chromium dependencies: `apt-get install -y libgbm-dev libnss3 libatk-bridge2.0-0 libgtk-3-0 libasound2`
- [ ] All env vars (Supabase, Azure AI Foundry, model config) set in Azure App Service Configuration

**Verification:**
- [ ] Push to `main` → GitHub Actions runs → Azure Web App updated
- [ ] Visit Azure Web App URL → app loads and sign-in works

**Dependencies:** Task 20

**Files likely touched:**
- `.github/workflows/deploy-web.yml`
- `web/next.config.js` (output: standalone for Azure)

**Estimated scope:** M

---

### Task 22: Azure Web App configuration

**Description:** Document all environment variables needed in Azure App Service Configuration. Configure Node.js version, startup command, and health check endpoint.

**Acceptance criteria:**
- [ ] `web/.env.example` contains every required variable with descriptions
- [ ] `tasks/azure-setup.md` documents step-by-step Azure App Service configuration
- [ ] Health check endpoint `GET /api/health` returns `{ status: 'ok' }`
- [ ] Puppeteer launches successfully in Azure environment (`--no-sandbox --disable-setuid-sandbox`)

**Verification:**
- [ ] Deploy to Azure → visit `/api/health` → `{"status":"ok"}`
- [ ] Generate a PDF from Azure deployment → downloads correctly

**Dependencies:** Task 21

**Files likely touched:**
- `web/app/api/health/route.ts`
- `web/.env.example`
- `tasks/azure-setup.md`

**Estimated scope:** S

---

### ✅ Checkpoint 6 — Deployment
- [ ] App deployed to Azure Web App
- [ ] Google sign-in works on production URL
- [ ] PDF generation works in production
- [ ] AI analysis works in production
- [ ] Credits deduct correctly in production
- [ ] **Final human review — ready to share**

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Puppeteer memory on Azure Free/B1 tier | High | Launch with `--no-sandbox`, close browser immediately after each PDF; upgrade to B2 if OOM |
| Azure AI Foundry rate limits | Medium | Add retry with exponential backoff in `foundry-client.js`; DeepSeek and GPT-4o have separate quotas |
| Supabase free tier row limits | Low | 500MB storage / 50k MAU — well within range for a marketing tool at launch |
| PDF generation timeout (default Next.js 30s) | Medium | Set `maxDuration = 60` on the generate-pdf route config |
| Google OAuth redirect URI mismatch in prod | Medium | Add production URL to Google Cloud Console OAuth allowed redirect URIs before go-live |

## Open Questions

- What is the Azure Web App name / URL? Needed for Google OAuth redirect URI and deployment workflow.
- What are the exact Azure AI Foundry deployment names for GPT-4o and DeepSeek?
- Should the `web/` directory live inside the existing repo or be a separate repo?
