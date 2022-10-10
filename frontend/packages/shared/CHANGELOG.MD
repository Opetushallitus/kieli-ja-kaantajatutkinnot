# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [Released]

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
