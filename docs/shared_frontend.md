# Shared Frontend [![Shared Frontend](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/shared_frontend.yml/badge.svg?branch=dev)](https://github.com/Opetushallitus/kieli-ja-kaantajatutkinnot/actions/workflows/shared_frontend.yml)

It contains the shared components, enums, hooks, interfaces, utils, and styles for the language and translator services of the Finnish National Agency for Education.

## Available Scripts

In this project directory, you can run:

```sh
  yarn shared:eslint     :  Run eslint checks

  yarn shared:format     :  Format

  yarn shared:lint       :  Run all linters

  yarn shared:stylelint  :  Run Stylelint checks

  yarn shared:test:jest  :  Run Jest tests

  yarn shared:tslint     :  Run Tslint checks
```

## Top-level directory layout

    .
    ├── ...
    ├── src
    │   ├── components          # React components
    │   ├── enums               # TS Enums
    │   └── hooks               # React hooks
    │   └── interfaces          # TS Interfaces
    │   └── styles              # SCSS styles
    │   └── utils               # Utils
    └── ...
