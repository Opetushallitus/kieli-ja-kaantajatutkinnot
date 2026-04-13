- Don't make self-explanatory comments. Comment only code that violates best practices in order for business domain logic to work.
- Prefer code style of the existing codebase. When there are conflicting coding styles, use this preference order:
  1. Current domain in the stack
  2. Current category / sub domain
  3. Stack (frontend or backend)

## Java

- When constructing multi-field DTOs or domain objects, prefer Lombok `@Builder` (`.builder()...build()`) over positional constructor calls. If a type is a `record` and needs to be constructed with many fields, convert it to a `@Builder` class instead.
