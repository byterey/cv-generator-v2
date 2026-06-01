# Security Policy

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report privately using [GitHub Security Advisories](https://github.com/byterey/now-cv/security/advisories/new).

Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept if possible)
- Affected versions or components

You will receive an acknowledgement within 5 business days.

## Scope

| Component | In scope |
|---|---|
| Web app (`/web`) — auth, CV data, AI routes | Yes |
| PDF generation (Puppeteer) | Yes |
| CLI tool | Yes |
| Third-party services (Supabase, Azure AI) | No — report to them directly |

## Out of scope

- Theoretical attacks with no practical impact
- Issues requiring physical access to a user's device
- Social engineering
