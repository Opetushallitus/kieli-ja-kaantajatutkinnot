## YKI Clerk Customer Details

Code flow from front to back. Frontend can use maven backend or MSW mock for local dev.

- Local dev with real backend: `yarn run yki:start:dev-server`
- Assume programmer is manually running the frontend; don't run it.

### Frontend

1. `frontend/packages/yki/src/enums/app.ts` — AppRoutes
2. `frontend/packages/yki/src/routers/AppRouter.tsx` — router logic
3. `frontend/packages/yki/src/pages/clerk/ClerkCustomerDetailsPage.tsx` — page
4. `frontend/packages/yki/src/components/clerk/ClerkCustomerDetails.tsx` — main component
5. `frontend/packages/yki/src/redux/selector/clerkCustomerDetails.ts` — selector
6. `frontend/packages/yki/src/redux/reducers/clerkCustomerDetails.ts` — reducer
7. `frontend/packages/yki/src/redux/sagas/clerkCustomerDetails.ts` — loadClerkCustomerDetailsSaga (calls API/MSW)
8. `frontend/packages/yki/src/utils/serialization.ts` — deserializeClerkCustomerDetailsResponse
9. `frontend/packages/yki/src/enums/api.ts` — APIEndpoints

### MSW

- Start: `yarn yki:clerk:start:msw`
- Test data: `frontend/packages/yki/src/test/msw/fixtures/customerDetails.ts`
- Handlers: `frontend/packages/yki/src/test/msw/handlers.ts`

### Backend

1. `backend/yki/src/main/java/fi/oph/yki/api/clerk/ClerkCustomerController.java` — controller
2. `backend/yki/src/main/java/fi/oph/yki/service/ClerkCustomerService.java` — business logic
3. `backend/yki/src/main/java/fi/oph/yki/repository/` — JPA repositories
4. `backend/yki/db/` — local database init scripts
5. `backend/yki/src/main/resources/db/changelog/` — Liquibase migrations
