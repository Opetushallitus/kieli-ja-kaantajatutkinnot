- Don't make self-explanatory comments. Comment only code that violates best practices in order for business domain logic to work, and only as often as the rest of the file does — most files have zero comments, so usually add none.
- Prefer code style of the existing codebase. When there are conflicting coding styles, use this preference order:
  1. Current domain in the stack
  2. Current category / sub domain
  3. Stack (frontend or backend)
- English: use words the repo already uses. `backend/vkt` is the reference when yki code is mixed. British spelling for new words (authorisation, organisation, initialise). Do not use: resolve, derive, persist, expose, ensure, compute. No shortened words (reg, eval, loc, req).

## Java

- When constructing multi-field DTOs or domain objects, prefer Lombok `@Builder` (`.builder()...build()`) over positional constructor calls. If a type is a `record`, keep it a record and add `@Builder` to it. Do not convert it to a class. Example: `ClerkOrganizerUpdateDTO`.
