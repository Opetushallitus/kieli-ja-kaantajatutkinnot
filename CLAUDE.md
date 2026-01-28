# Code style

- Don't make self-explanatory comments. Comment only code, that is violates best practises in order to the business domain logic work. 
- Prefer code style of the existing code base. Do not alter from the existing code style. When there are conflicting coding styles use this preference order:
  * current domain in the stack (stack = frontend or backend)
  * current category / sub domain
  * stack (frontend or backend)

# Structure
- Code base is split by frontend and backend. Inside of them the code is split by domains. For example the backend logic for yki domain is at @backend/yki folder, and the frontend logic is at @frontend/packages/yki

# Database
- The database for yki - domain is older than our backend. The old backend is remotely at https://github.com/Opetushallitus/yki, and locally potentially at `../yki` 

# Context examples

## yki clerk customer details
- The code flow from front to back
- frontend can use maven backend, but for local development there is also MSW mock available.
- when using locally real backend: yarn run yki:start:dev-server
- It is safe to assume, when you are making changes on frontend, the programmer is manually running the frontend, so you don't need to run it.

#### frontend context
1. @frontend/packages/yki/src/enums/app.ts/AppRoutes - defines frontend routes
2. @frontend/packages/yki/src/routers/AppRouter.tsx - frontend router logic
3. @frontend/packages/yki/src/pages/clerk/ClerkCustomerDetailsPage.tsx - the frontend page
4. @frontend/packages/yki/src/components/clerk/ClerkCustomerDetails.tsx - the main component
5. @frontend/packages/yki/src/redux/selector/clerkCustomerDetails.ts - the selector of the main component.
6. @frontend/packages/yki/src/redux/reducers/clerkCustomerDetails.ts - the reducer
8. @frontend/packages/yki/src/redux/sagas/clerkCustomerDetails.ts/loadClerkCustomerDetailsSaga - calls backend API/MSW
7. @frontend/packages/yki/src/utils/serialization.ts/deserializeClerkCustomerDetailsResponse - deserialize the response for frontend
9. @frontend/packages/yki/src/enums/api.ts/APIEndpoints - defined the API endpoints

#### MSW
- Running frontend with MSW mock: yarn yki:clerk:start:msw
- The test data: @frontend/packages/yki/src/test/msw/fixtures/customerDetails.ts
- MSW handlers: @frontend/packages/yki/src/test/msw/handlers.ts

### backend
 1. @backend/yki/src/main/java/fi/oph/yki/api/clerk/ClerkCustomerController.java - backend controllers
 2. @backend/yki/src/main/java/fi/oph/yki/service/ClerkCustomerService.java - backend business logic.
 3. @backend/yki/src/main/java/fi/oph/yki/repository - folder, JPA entrypoints to database
 4.  @backend/yki/db - folder: local database initialization scripts
 5. @backend/yki/src/main/resources/db/changelog - liquibase migrations

## Liquibase
* If you are assigned to update migration, do not create new migration file, but update the existing one.

