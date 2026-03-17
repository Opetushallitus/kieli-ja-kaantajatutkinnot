# YKI Test Migration: HSQLDB → TestContainers (PostgreSQL)

## Goal
Replace HSQLDB with real PostgreSQL containers in all YKI backend tests,
so tests run against the same schema and DB as production.

## Status

- [x] `ClerkExamDateServiceTest` — migrated (this branch)
- [ ] `ClerkExamSessionServiceTest` — uses `@DataJpaTest` (implicit HSQLDB)
- [ ] `RegistrationServiceTest` — uses `@DataJpaTest` (implicit HSQLDB)
- [ ] `ClerkIndexControllerIntegrationTest` — uses `@ActiveProfiles("test-hsql")`
- [ ] `PublicIndexControllerIntegrationTest` — uses `@ActiveProfiles("test-hsql")`
- [ ] `YkiApplicationTests` — uses `@ActiveProfiles("test-hsql")`

## Pattern (from ClerkExamDateServiceTest)

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
@ImportAutoConfiguration(LiquibaseAutoConfiguration.class)
public class SomeServiceTest {

  @Container
  @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

  // ...
}
```

For `@SpringBootTest` tests (integration tests + YkiApplicationTests):
- Remove `@ActiveProfiles("test-hsql")`
- Add `@Testcontainers` + `@Container @ServiceConnection` PostgreSQLContainer

## Cleanup (when all tests migrated)
- [ ] Delete `backend/yki/src/test/resources/application-test-hsql.yaml`
- [ ] Consider removing `hsqldb` dependency from `backend/pom.xml` (check if other modules still need it)
