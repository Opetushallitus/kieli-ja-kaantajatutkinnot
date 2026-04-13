# Testing

## Java — Test Data Setup

In `@DataJpaTest` service tests, set up test data using `Factory.*()` methods with `TestEntityManager.persist()`.

Reference: `ClerkExamSessionServiceTest` and `RegistrationServiceTest` are the canonical examples.

**If the primary `Factory` + `entityManager` approach hits a blocker** (e.g. a JPA model is missing fields, or an entity doesn't exist yet), do not assume a workaround. Stop and discuss with the user to decide the right path — whether that means extending the model, adding a factory method, or accepting raw SQL for that specific case.
