## YKI Clerk Quarantine (Osallistumiskiellot)

Three-tab view at `/yki/v2/virkailija/osallistumiskiellot`. All tabs share the same page/reducer/saga files; state is split by tab.

### Backend API

All under `ClerkQuarantineController` → `ClerkQuarantineService`.

| Method   | Path                                                   | Tab             | Notes                                                               |
| -------- | ------------------------------------------------------ | --------------- | ------------------------------------------------------------------- |
| `GET`    | `/v2/api/clerk/quarantine/`                            | Voimassa olevat | Returns non-deleted quarantines                                     |
| `POST`   | `/v2/api/clerk/quarantine`                             | Voimassa olevat | Create; reuses `CreateQuarantineRequest`                            |
| `PUT`    | `/v2/api/clerk/quarantine/{id}`                        | Voimassa olevat | Update; reuses `CreateQuarantineRequest`                            |
| `DELETE` | `/v2/api/clerk/quarantine/{id}`                        | Voimassa olevat | Soft-delete (`deleted_at = now()`)                                  |
| `GET`    | `/v2/api/clerk/quarantine/reviews`                     | Aiemmat         | Completed reviews (`quarantine_review` rows)                        |
| `GET`    | `/v2/api/clerk/quarantine/matches`                     | Odottavat       | Unreviewed matches; enriches SSN from ONR                           |
| `PUT`    | `/v2/api/clerk/quarantine/:id/registration/:regId/set` | Odottavat       | Accept/reject verdict; cancels registration when `quarantined=true` |

### Frontend

Base: `frontend/packages/yki/clerk/src/`

1. `enums/app.ts` — `AppRoutes.ClerkQuarantine`
2. `routers/AppRouter.tsx` — route
3. `pages/ClerkQuarantinePage.tsx` — page wrapper
4. `components/clerkQuarantine/ClerkQuarantine.tsx` — tab switcher + load triggers
5. `components/clerkQuarantine/listing/ActiveQuarantinesListing.tsx` — Voimassa olevat table
6. `components/clerkQuarantine/listing/AddNewQuarantineModal.tsx` — create modal
7. `components/clerkQuarantine/listing/EditQuarantineModal.tsx` — edit modal
8. `components/clerkQuarantine/listing/DeleteQuarantineConfirmationModal.tsx` — delete modal
9. `components/clerkQuarantine/listing/PastReviewsListing.tsx` — Aiemmat table
10. `components/clerkQuarantine/listing/PendingReviewsListing.tsx` — Odottavat table
11. `components/clerkQuarantine/listing/RegistrationConfirmationModal.tsx` — accept/reject modal
12. `redux/reducers/clerkQuarantine.ts` — all three tabs' state
13. `redux/sagas/clerkQuarantine.ts` — all API calls
14. `redux/selectors/clerkQuarantine.ts` — `selectSortedActiveQuarantines` etc.
15. `interfaces/clerkQuarantine.ts` — TS types
16. `utils/serialization.ts` — date deserialization (string → dayjs)
17. `enums/api.ts` — `APIEndpoints.ClerkQuarantine*`

### Backend files

Base: `backend/yki/src/main/java/fi/oph/yki/`

- `api/clerk/ClerkQuarantineController.java`
- `service/ClerkQuarantineService.java`
- `model/Quarantine.java`, `model/QuarantineReview.java`
- `repository/QuarantineRepository.java` — `findPendingMatches()`, `findAllReviews()`
- `repository/QuarantineMatchProjection.java`, `QuarantineReviewProjection.java`
- `api/dto/clerk/ClerkQuarantinesDTO.java` — active list DTO
- `api/dto/clerk/ClerkQuarantineMatchDTO.java`, `ClerkQuarantineReviewDTO.java`
- `api/dto/clerk/ClerkQuarantinePersonDTO.java` — shared person sub-DTO
- `api/dto/clerk/CreateQuarantineRequest.java` — reused for create + update
- `service/ClerkQuarantineServiceTest.java`

### MSW test data

- `tests/msw/fixtures/activeQuarantines.ts`
- `tests/msw/fixtures/quarantineMatches.ts`
- `tests/msw/fixtures/quarantineReviews.ts`
- `tests/msw/handlers.ts` — GET/PUT handlers present; DELETE handler missing (returns 404 in MSW)

### Key quirks

- `languageCode` is trimmed in service layer — legacy DB column is `CHAR`, not `VARCHAR`.
- "Accept" button in Odottavat (`is_quarantined: false`) means the clerk accepts the match verdict (person is NOT quarantined). "Reject" (`is_quarantined: true`) cancels the registration.
- PUT update reuses `CreateQuarantineRequest` — no separate update DTO.
- Diary number has a unique constraint; `createQuarantine` maps `quarantine_diary_number_key` violation → `QUARANTINE_DIARY_NUMBER_ALREADY_EXISTS`.
- After successful edit/delete, saga re-fires `loadClerkActiveQuarantines()` to refresh.
