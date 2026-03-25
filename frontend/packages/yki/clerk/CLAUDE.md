# YKI Clerk Frontend

This is the clerk (virkailija) UI for YKI (Yleiset kielitutkinnot). 

## Local Development

```bash
# With MSW mocks (preferred for frontend-only development)
yarn yki:clerk:start:msw

# With real backend at localhost:8083
yarn yki:clerk:start
```

Uses webpack with hot reload.

## Code Style

Follow existing code patterns. When creating new components, copy similar existing components to maintain consistency.

- Prettier: 2-space indent, single quotes, 80 char line width
- ESLint: absolute imports only (no relative `./` imports), alphabetized imports
- Import order: external packages first, then internal modules (separated by blank line)
- Blank line before return statements

## Project Structure

```
src/
├── components/          # React components grouped by feature
├── configs/             # axios, i18n, redux configuration
├── enums/               # TypeScript enums (api.ts has endpoints)
├── hooks/               # Custom React hooks
├── interfaces/          # TypeScript interfaces
├── pages/               # Page components (routed views)
├── redux/
│   ├── reducers/        # Redux Toolkit slices
│   ├── sagas/           # Redux-saga side effects
│   └── selectors/       # Reselect selectors
├── routers/             # React Router configuration
├── styles/              # SCSS files (components have own .scss)
└── tests/
    ├── cypress/         # Integration tests
    ├── jest/            # Unit tests (minimal)
    └── msw/
        ├── fixtures/    # Mock data
        └── handlers.ts  # MSW request handlers
public/
└── i18n/                # Translation files (fi-FI, sv-SE, en-GB)
```

## State Management

Redux Toolkit with redux-saga:

1. **Reducer** (`redux/reducers/`) - createSlice with actions
2. **Saga** (`redux/sagas/`) - handles API calls, dispatches store/reject actions
3. **Selector** (`redux/selectors/`) - derives data from state

Pattern: `load*` action triggers saga → saga calls API → deserialize → `store*` or `reject*` action updates state.

API responses are deserialized in [src/utils/serialization.ts](src/utils/serialization.ts) before storing in Redux (e.g., date strings → dayjs objects).

### Clerk customer details flow (example)

1. [src/enums/app.ts](src/enums/app.ts) — `AppRoutes` defines frontend routes
2. [src/routers/AppRouter.tsx](src/routers/AppRouter.tsx) — router logic
3. [src/pages/ClerkCustomerDetailsPage.tsx](src/pages/ClerkCustomerDetailsPage.tsx) — page component
4. [src/components/clerk/clerkCustomer/ClerkCustomerDetails.tsx](src/components/clerk/clerkCustomer/ClerkCustomerDetails.tsx) — main component
5. [src/redux/selectors/clerkCustomerDetails.ts](src/redux/selectors/clerkCustomerDetails.ts) — selector
6. [src/redux/reducers/clerkCustomerDetails.ts](src/redux/reducers/clerkCustomerDetails.ts) — reducer
7. [src/redux/sagas/clerkCustomerDetails.ts](src/redux/sagas/clerkCustomerDetails.ts) — saga: calls backend API or MSW
8. [src/utils/serialization.ts](src/utils/serialization.ts) — deserializes API response (e.g. `deserializeClerkCustomerDetailsResponse`)
9. [src/enums/api.ts](src/enums/api.ts) — `APIEndpoints` defines API endpoints

## API Endpoints

- Defined in [src/enums/api.ts](src/enums/api.ts)
- Path params use `:param` syntax (e.g., `/customer/:oid`)
- Replace params in sagas: `APIEndpoints.X.replace(/:param$/, value)`
- Old API uses snake_case, new API (v2) uses camelCase

## MSW Mocks

When developing, endpoints are mocked in [src/tests/msw/handlers.ts](src/tests/msw/handlers.ts):
- Add fixture data in `src/tests/msw/fixtures/`
- Import and use in handlers.ts

## i18n Translations

- Files: `public/i18n/{fi-FI,sv-SE,en-GB}/{common,public}.json`
- During development: write Finnish text, copy same value to Swedish and English
- Use `useCommonTranslation()` hook with `keyPrefix: 'yki.common'`
- Translators will translate later

### Which file to edit

- `common.json` — shared keys under `yki.common.*` (generic errors, labels, dates, etc.)
- `public.json` — component/page-specific keys under `yki.component.*` and `yki.pages.*`

### Key naming convention

- Generic error: `yki.common.error`
- Component-specific errors: `yki.component.<componentName>.errors.<key>` (e.g. `yki.component.clerkExamDate.errors.loadingFailed`)
- Always update all three locale files (fi-FI, sv-SE, en-GB) with the same Finnish text during development

## Styling

- SCSS files in `src/styles/`
- Components have their own `.scss` files in corresponding folders
- Global styles and variables in `styles/base/` and `styles/colors/`

## Testing

- Cypress integration tests in `src/tests/cypress/`
- Run: `yarn yki:clerk:test:cypress` or `yarn yki:clerk:test:cypress:open`
- Fixtures (`tests/msw/fixtures/`) contain hardcoded values used by both MSW handlers and tests
- Tests can assert against fixture values directly (import from fixtures)

## Shared Package

The `shared` package provides common utilities, enums, and types:
- `APIResponseStatus` enum for loading states
- `DateUtils` for date formatting
- `AppLanguage`, `I18nNamespace` enums

