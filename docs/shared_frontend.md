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

## How to install the package?

1. Create an access token as instructed [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token), and select ONLY `read:packages` as the scope
2. Add created token to your bash profile:

   ```sh
    PROFILE_ADDRESS=~/.zshrc  # Depends on your current active profile. ~/.zshrc or ~/.bashrc
    echo 'export GITHUB_REGISTRY_TOKEN="created_token_here"' >> $PROFILE_ADDRESS
   ```

3. Reload bash profile configs

   ```sh
     source $PROFILE_ADDRESS
   ```

4. (Optional) Run `yarn add shared@npm:@opetushallitus/kieli-ja-kaantajatutkinnot.shared@version` to install the package
