## Summary
<!-- What does this PR do? 1-2 sentences.
     Do NOT include internal notes, planning docs, or AI session URLs here. -->

## Type
- [ ] Bug fix
- [ ] New feature / enhancement
- [ ] Refactor / cleanup
- [ ] Docs / config only

## Changes
<!-- Bullet list of what changed and why. -->
-

## Testing
- [ ] `cd web && npm run build` passes with no type errors
- [ ] Manually verified the affected flow in the browser
- [ ] PDF output is selectable text (ATS-safe) — checked where relevant

## Checklist
- [ ] No `.env` values, API keys, credentials, or secrets appear anywhere in the diff
- [ ] No AI session URLs or internal planning notes in commit messages or PR body
- [ ] `web/.env.example` updated if new environment variables were added
- [ ] `tasks/todo.md` updated if a task was completed or added
- [ ] `web/supabase/schema.sql` updated if the DB schema changed
- [ ] Breaking changes noted below (if any)

## Breaking changes
<!-- Delete this section if none. -->

<!--
MERGE POLICY: squash-merge only.
The PR title becomes the single merge commit on main — make it
imperative, under 72 chars, no trailing period.
Example: "feat: add PDF preview iframe to CV page"
-->