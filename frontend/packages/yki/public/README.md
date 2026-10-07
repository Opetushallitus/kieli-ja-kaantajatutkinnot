# YKI public UI

## Components and style ownership

YKI public uses the `opintopolku` variant of the OPH design system. Other frontend
applications still use legacy shared components; keep their appearance unchanged
when improving this application.

| Responsibility                                                                   | Location                                       |
| -------------------------------------------------------------------------------- | ---------------------------------------------- |
| Standard OPH controls                                                            | `@opetushallitus/oph-design-system`            |
| Reusable adapters, including responsive dropdowns, labeled inputs and navigation | `shared/ods-components`                        |
| Application theme, selected UI language and color aliases                        | `src/ophTheme`                                 |
| YKI typography shortcuts (`Text`, `Label`, `H1`–`H5`)                            | `src/components/Text.tsx`                      |
| Page layout, header/footer arrangement and registration-specific styles          | `src/styles/components` and `src/styles/pages` |
| Temporary styling for legacy shared components                                   | `src/styles/overrides/_legacy-shared.scss`     |

Compose existing OPH components rather than copying their internals. A reusable
adapter should own its styles (`sx`, `styled`, or a colocated stylesheet) and must
not depend on a consuming application's global utility classes. Share behaviour
between presentations where useful; do not change legacy shared components just
to change the appearance of YKI public.

MUI remains appropriate for components without an OPH equivalent and for thin
legacy wrappers that already inherit the application theme. There is no need to
copy a wrapper just to change its import path. ESLint prevents importing the
legacy versions of components for which an ODS adapter is already available.

`LabeledTextField` composes `OphFormFieldWrapper` with a MUI TextField to preserve
existing TextField validation and read-only slot props. Its `className`, `sx` and
`fullWidth` apply to the entire labeled field. For compatibility, `placeholder`
is explanatory text above the input and `helperText` is displayed below it.
Prefer the upstream `OphInputFormField` for new fields that do not require this
compatibility API. Use `Label` for displayed field labels and semantic emphasis
for emphasized prose; the legacy `.bold` and `.heading-text` utilities are not
part of this application's styles.

## Theme and Sass

`YkiThemeProvider` is the sole theme creation point and follows the i18next
language. Tests use the same provider. Pass theme **options**, not an already
constructed theme, to it.

`ophTheme/colors.ts` maps semantic aliases to `ophColors` and exposes the same
values as `--yki-*` CSS variables through the theme. `_colors.scss` only bridges
those variables to existing Sass names. Add new reusable control styling to its
component; do not add broad MUI descendant overrides to the application theme.

The root is consistently `62.5%` (10px with the default browser font size),
matching `htmlFontSize: 10`. Existing layout rem values rely on this convention.
Do not reintroduce the legacy 9px desktop root or compensate with per-control
font-size overrides. ODS owns control typography; page-specific exceptions should
have a concrete design reason.

The initial loading spinner exists before React mounts. It shares its animation
with the legacy applications and has one documented green fallback while theme
variables are unavailable. Keep the fallback aligned with `ophColors.green2`.

The remaining compatibility stylesheet only adapts the legacy shared color
utility and notification-dialog border. Remove each rule when the corresponding
legacy component is migrated; do not use it for new components.

## Validation

From this directory, run the existing scripts:

- `yarn yki:tslint` for TypeScript.
- `yarn yki:test:jest --runInBand --watch=false` for tests.
- `yarn yki:build` for the production bundle, including Sass.

Check responsive form layout, keyboard focus and FI/SV/EN language switching in
the browser when changing components or theme styles. Shared adapter changes
also need the shared package checks, a `CHANGELOG.MD` entry, and a package version
update. Keep this application's shared dependency and the workspace lockfile in
sync with the version it requires.
