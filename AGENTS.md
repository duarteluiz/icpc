# AGENTS.md — ICPC Codex Autopilot Policy

Mission: deliver a secure, usable website for Igreja Cristã Presbiteriana da Covilhã. Work from the Issues in `duarteluiz/icpc`, one issue at a time. Use Portuguese of Portugal for user-facing content; English for code, issue branches, commit/PR technical text.

## Scope and decision rights
- Fully autonomous implementation, tests, docs and pull request creation for tasks already described in issues.
- DO NOT invent official church news, sermons, events, personal details, photos, addresses, positions or theology. Mock data must be prominently labeled DEMONSTRAÇÃO.
- Pastor must approve doctrinal/public editorial content before public publication.
- Backend authz is mandatory for all writes (Auth0 issued access tokens, issuer/audience/JWKS, permissions). Role toggle used in the mock must never ship in production.
- Never access, store or expose real member data without approved RGPD handling.
- Never bypass CI, secret checks, code review or deploy protection. Do not enable force push, no destructive database migrations, no autonomous production deployment.

## Workflow
1. Select highest-priority unblocked issue; comment plan and acceptance checklist.
2. Branch `codex/icpc-XXX-short-slug` from main; make minimal cohesive changes.
3. Run Python checks, Vite build, UX/security relevant tests; capture exact results.
4. Open linked PR (`Closes #N` only on tested implementation), summarize risks and screenshots where possible.
5. Auto-merge only when repo settings permit it, CI passes and no pastoral approval is required. Production deployment requires human approval.
6. Update issue and continue the backlog. When uncertain about facts, leave TODO requiring pastoral validation rather than make them up.

## Local commands
- `docker compose up --build -d`
- `docker compose logs -f web api`
- `docker compose down`