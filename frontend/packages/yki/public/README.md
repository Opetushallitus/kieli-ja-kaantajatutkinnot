# YKI public UI

## Components and style ownership

YKI public uses the `opintopolku` variant of the OPH design system. Other frontend
applications still use legacy shared components; keep their appearance unchanged
when improving this application.

| Responsibility                                                                   | Location                                   |
| -------------------------------------------------------------------------------- | ------------------------------------------ |
| Standard OPH controls                                                            | `@opetushallitus/oph-design-system`        |
| Reusable adapters, including responsive dropdowns, labeled inputs and navigation | `shared/ods-components`                    |
| Application theme, selected UI language and color aliases                        | `src/ophTheme`                             |
| YKI typography shortcuts (`Text`, `Label`, `H1`–`H3`)                            | `src/components/Text.tsx`                  |
| Temporary styling for legacy shared components                                   | `src/styles/overrides/_legacy-shared.scss` |

## Theme

The root is consistently `62.5%` (10px with the default browser font size),
matching `htmlFontSize: 10`. Existing layout rem values rely on this convention.
Do not reintroduce the legacy 9px desktop root or compensate with per-control
font-size overrides. ODS owns control typography; page-specific exceptions should
have a concrete design reason.
