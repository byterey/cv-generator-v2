# Contributing to CV Generator

Thanks for your interest in contributing.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Make your changes
5. Test: `npm run build` and verify the output in `output/`
6. Submit a pull request

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Update the README if you change CLI flags, options, or behavior
- Test your changes against the sample data and verify PDF output is selectable
- Follow existing code style (no trailing semicolons, ES modules)

## Coding Conventions

- ES modules (`import` / `export`), not CommonJS
- No new dependencies without discussion (the goal is a minimal dependency footprint)
- ATS compatibility is non-negotiable — templates must produce selectable, single-column output
- CSS stays inline in the template (no separate stylesheets)

## Template Contributions

If contributing a new template:

- It must pass ATS validation: text selectability, correct heading hierarchy, no hidden content
- Single-column only (ATS reads DOM order, not CSS-reordered content)
- No external CDN dependencies (fonts, CSS, JS)
- System fonts only

## Code of Conduct

Be respectful. Assume good intent. Focus on the work.