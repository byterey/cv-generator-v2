# now-cv Web App — Task List

## Phase 1: Foundation
- [ ] T1 — Scaffold Next.js 14 + Tailwind, copy template + cv-engine.js
- [ ] T2 — Supabase: project, tables (cvs, user_credits, usage_logs), RLS, env vars
- [ ] T3 — Google sign-in flow (sign-in page, OAuth callback, session)
- [ ] T4 — Auth middleware (protect all routes except /, /signin, /auth/callback)
- [ ] ✅ Checkpoint 1: sign-in works, routes protected

## Phase 2: CV Builder
- [ ] T5  — Dashboard (list CVs, credit badge, new/edit/delete)
- [ ] T6  — Wizard Step 1: Personal info
- [ ] T7  — Wizard Step 2: Experience (dynamic add/remove entries + bullets)
- [ ] T8  — Wizard Steps 3–4: Education + Skills (tag input)
- [ ] T9  — Wizard Steps 5–6: Certifications, Projects, Review
- [ ] T10 — Save/load CV to Supabase, rename, edit existing
- [ ] ✅ Checkpoint 2: full wizard flow, save/reload, dashboard

## Phase 3: PDF Generation
- [ ] T11 — PDF API route (Puppeteer + Handlebars, accepts JSON body)
- [ ] T12 — CV preview page (iframe) + Download PDF button
- [ ] ✅ Checkpoint 3: PDF downloads, text selectable

## Phase 4: AI Integration
- [ ] T13 — ai.config.js + Azure AI Foundry client (config-driven model routing)
- [ ] T14 — JD analysis API route (DeepSeek, credit check, usage log)
- [ ] T15 — JD analysis UI (paste JD, Tier badge, structured report)
- [ ] T16 — CV generation API route (GPT-4o, overlay JSON, credit check)
- [ ] T17 — CV generation UI (show tailored diff, download tailored PDF)
- [ ] ✅ Checkpoint 4: end-to-end AI flow, model swap via env var

## Phase 5: Credits
- [ ] T18 — Credit init on first sign-in + monthly reset logic
- [ ] T19 — Credit badge in header, out-of-credits UX
- [ ] ✅ Checkpoint 5: credits deduct, reset, friendly out-of-credits message

## Phase 6: Launch
- [ ] T20 — Landing page (hero, features, CTA)
- [ ] T21 — GitHub Actions → Azure Web App CI/CD
- [ ] T22 — Azure configuration, health endpoint, env var docs
- [ ] ✅ Checkpoint 6: deployed, end-to-end works in production
