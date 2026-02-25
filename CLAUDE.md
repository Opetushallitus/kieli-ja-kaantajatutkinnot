# Code style

- Don't make self-explanatory comments. Comment only code, that is violates best practises in order to the business domain logic work.
- Prefer code style of the existing code base. Do not alter from the existing code style. When there are conflicting coding styles use this preference order:
  * current domain in the stack (stack = frontend or backend)
  * current category / sub domain
  * stack (frontend or backend)

# Structure

Code base is split by frontend and backend. Inside of them the code is split by domains.
- Backend yki domain: `backend/yki/` — see `backend/yki/CLAUDE.md`
- Frontend yki clerk: `frontend/packages/yki/clerk/` — see `frontend/packages/yki/clerk/CLAUDE.md`

## Plan File Naming Convention

When creating plans, use this format:
`~/.claude/plans/YYYY-MM-DD-feature-name.md`

Example: `2025-02-13-user-authentication.md`

Always include:
- ISO date prefix (YYYY-MM-DD)
- Kebab-case feature name
- .md extension
