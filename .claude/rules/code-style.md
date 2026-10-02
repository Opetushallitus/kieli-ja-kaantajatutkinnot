- Don't make self-explanatory comments. Comment only code that violates best practices in order for business domain logic to work, and only as often as the rest of the file does — most files have zero comments, so usually add none.
- Prefer code style of the existing codebase. When there are conflicting coding styles, use this preference order:
  1. Current domain in the stack
  2. Current category / sub domain
  3. Stack (frontend or backend)
- English: use words the repo already uses. `backend/vkt` is the reference when yki code is mixed. British spelling for new words (authorisation, organisation, initialise). Do not use: resolve, derive, persist, expose, ensure, compute. No shortened words (reg, eval, loc, req).

## Java

- When constructing multi-field DTOs or domain objects, prefer Lombok `@Builder` (`.builder()...build()`) over positional constructor calls. If a type is a `record`, keep it a record and add `@Builder` to it. Do not convert it to a class. Example: `ClerkOrganizerUpdateDTO`.
- Time zone: the machine's time zone is set correctly, and the JVM uses it. Use `LocalDateTime` and JSON without a zone. Do not add `OffsetDateTime`, `Instant` or zone conversion only because "the JVM might run in UTC". Missing zone settings in the repo are not a bug.
- Read-only service methods: `@Transactional(readOnly = true)`.
- Check DTO fields with `@NonNull` / `@NotNull`, not with null checks in the service.
- Sanitise user input strings with `StringUtil.sanitize`, as in `ClerkExamSessionUpdateDTO`.
- Repository: a Spring Data method name (`countByPersonOid`) before own SQL. In SQL, `ILIKE`, not `LOWER(...) LIKE`. Query results go in a projection, e.g. `QuarantineMatchProjection`.
- yki: public-side logic goes in `Public*Service`, cache settings in `CacheConfig`. An update writes to the audit log. Hetu checks use `HetuUtils` (`backend/vkt/.../util/`).

## Frontend

- API URLs go in the `APIEndpoints` enum (`src/enums/api.ts`).
- Use an OPH design system component (`OphInputFormField`, `OphRadioGroupFormField`) when one exists.
- Boolean state names start with `is`: `isModalOpen`, `setIsModalOpen`.
- `===`, not `==`.
- Texts come from the translation files. The key path matches the component's translation prefix.
- Shared styles go in `src/styles/components/`, not copied between pages.
