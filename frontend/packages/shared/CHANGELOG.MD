# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [Released]

## [1.6.0] - 2023-02-06

### Changed

- DateUtils.formatOptionalDate and DateUtils.formatOptionalDateTime now support passing an optional format string.

## [1.5.11] - 2023-01-31

### Added

- light-blue color for progressbar

## [1.5.10] - 2023-01-26

### Added

- DropDownMenuButton component

## [1.5.9] - 2023-01-20

### Added

-  error, showHelperText and helperText props for DatePicker

## [1.5.8] - 2023-01-17

### Added

- TextFieldTypes.number

## [1.5.7] - 2023-01-13

### Added

- DialogBox now supports severity: Warning
- warning color: Yellow-500

## [1.5.6] - 2022-12-12

### Added

- DateUtils.formatOptionalDateTime
- NormalTable (Table without pagination)

### Changed

- DatePicker data-testid removed as it is not propagated and not visible in Cypress

## [1.5.5] - 2022-12-12

### Changed

- Removed `padding-left` from `bold` class

## [1.5.4] - 2022-12-08

### Changed

- `AccessibilityStatementContent` component added
- `ExtLink` takes also `sx` and other `CustomButton` props

## [1.5.3] - 2022-12-05

### Changed

- Moved colors under `_colors.scss` with names and presentation matching Figma specs

## [1.5.2] - 2022-11-30

### Fixed

- LoadingProgressIndicator useable for block display

## [1.5.1] - 2022-11-16

### Fixed

- Fixed CustomSwitch padding

### Changed

- DatePicker label is now optional

### Added

- Capitalise function added to StringUtils
- Validation function added DateUtils

## [1.5.0] - 2022-11-14

### Added

- New `StyleCacheProvider` to simplify setting up Emotion styles with a CSP nonce read from
  a `<meta name="csp-nonce" ... />` tag

## [1.4.3] - 2022-11-03

### Added

- Color `color-grey-600` class

## [1.4.2] - 2022-11-02

### Changed

- ExtLink now also accepts a startIcon

## [1.4.1] - 2022-10-25

### Changed

- CookieBanner consent is now stored in a cookie

## [1.4.0] - 2022-10-25

### Changed

- Added ManagedPaginatedTable to control pagination state outside the component

## [1.3.10] - 2022-10-14

### Changed

- Updated CookieBanner layout for mobile

## [1.3.9] - 2022-10-11

### Changed

- Remove `maxHeight: 100%` from the `columns` CSS class.
  Doesn't seem to affect layout in any other way than circumventing
  an issue on Safari when a child with this class is contained within
  a grid row.

## [1.3.8] - 2022-10-04

### Added

- I18nNamespace `clerk` and `public`

## [1.3.7] - 2022-09-28

### Changed

- Updated `LanguageSelect` parameters

## [1.3.6] - 2022-09-28

### Fixed

- Use global dayjs locale instead of the locale that was used when constructing individual Dayjs instances
  when formatting dates within `DateUtils.formatOptionalDate`

## [1.3.5] - 2022-09-26

### Changed

- Replaced `headerTitle` with `headerContent` under PaginatedTable

## [1.3.4] - 2022-09-13

### Added

- CookieBanner

## [1.3.3] - 2022-09-16

### Changed

- Allow passing headerTitle to PaginatedTable
- Added `shared:format:write` command to package.json

## [1.3.2] - 2022-09-12

### Fixed

- Styles of init spinner

## [1.3.1] - 2022-09-06

### Changed

- Allow passing maxTextAreaLength to inspectCustomTextFieldErrors

## [1.3.0] - 2022-09-05

### Added

- MU Date picker

## [1.2.6] - 2022-08-29

### Added

- Root styles and helper classes
- trimAndLowerCase to String utils

### Changed

- Props to show Table pagination

## [1.2.5] - 2022-08-29

### Added

- onClose handler for DialogBox

## [1.2.4] - 2022-08-26

### Changed

- Refactored useToast, useDialog and notifierContext

## [1.2.3] - 2022-08-24

### Changed

- Refactored useToast and useDialog to use useCallBack

## [1.2.2] - 2022-08-24

### Changed

- Parameters of showToast and showDialog hooks

## [1.2.1] - 2022-08-23

### Added

- Support onClose action with Toast

## [1.2.0] - 2022-08-23

### Added

- DialogBox
- Toast
- Notifier and NotifierProvider

## [1.1.1] - 2022-08-22

### Fixed

- Absolute import in OPHClerkLogo

## [1.1.0] - 2022-08-19

### Added

- New component OPHClerkLogo

## [1.0.19] - 2022-08-15

### Added

- New component InfoText
- Styles for custom switch

## [1.0.18] - 2022-08-09

### Fixed

- Datepicker min and max values are now formatted correctly

## [1.0.17] - 2022-06-21

### Added

- KoodistoRegions I18n namespaces

## [1.0.16] - 2022-06-08

### Changed

- Use common webpack config

## [1.0.15] - 2022-06-01

### Added

- StringUtils.isNonBlank(value?: string)
- StringUtils.getWithPlaceHolder(value?: string, placeholder = '-')

## [1.0.14] - 2022-05-19

### Fixed

- Autocomplete label rendering

## [1.0.13] - 2022-05-17

### Added

- KoodistoRegions and Privacy I18n namespaces

## [1.0.12] - 2022-05-16

### Changed

- Expose more accurate types from LangSelectorProps

## [1.0.11] - 2022-05-13

### Added

- Table styles
- LangSelector component

### Fixed

- Test performance

## [1.0.10] - 2022-05-13

### Added

- Imported dayjs locales for Finnish, Swedish and English as part of DateUtils.
- Exposed function to globally set dayjs locale within DateUtils.

## [1.0.9] - 2022-05-12

### Added

- More utils from AKT
- More hooks from AKT

## [1.0.8] - 2022-05-11

### Added

- Exported static files

### Changed

- Directory static to statics

## [1.0.7] - 2022-05-10

### Changed

- Refactor shared elements
- Increase snapshot test coverage for shared elements

## [1.0.6] - 2022-05-10

### Fixed

- Absolute imports in Table component

## [1.0.5] - 2022-05-10

### Fixed

- Autocomplete type export

## [1.0.4] - 2022-05-10

### Fixed

- Package.json type definitions

## [1.0.3] - 2022-05-09

### Added

- Installation instructions

## [1.0.2] - 2022-05-09

### Fixed

- Added missing import

## [1.0.1] - 2022-05-06

### Fixed

- Missing style imports on shared components

### Changed

- Logoviewer props

### Added

- DialogType enums

## [1.0.0] - 2022-05-03

### Added

- Default NPM scope for @opetushallitus
- PackageManager to root package.json
- Rename shared stylings

## [0.0.2] - 2022-04-29

### Added

- React Components
- Utils
- Shared styles
- Hooks

## [0.0.1] - 2022-04-20

### Added

- Shared package initialized
