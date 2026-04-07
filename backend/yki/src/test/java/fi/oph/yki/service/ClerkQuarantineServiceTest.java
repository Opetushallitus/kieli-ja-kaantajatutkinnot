package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchDTO;
import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchesResponseDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.QuarantineRepository;
import jakarta.annotation.Resource;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
public class ClerkQuarantineServiceTest {

  @Resource
  private QuarantineRepository quarantineRepository;

  @Resource
  private JdbcTemplate jdbcTemplate;

  @MockBean
  private OnrService onrService;

  @MockBean
  private AuditService auditService;

  private ClerkQuarantineService clerkQuarantineService;

  @BeforeEach
  public void setup() {
    clerkQuarantineService =
      new ClerkQuarantineService(quarantineRepository, onrService, auditService, new ObjectMapper());

    // exam_date: id=100, within ban date range
    jdbcTemplate.update(
      "INSERT INTO exam_date (id, exam_date, registration_start_date, registration_end_date) VALUES (100, '2026-05-09', '2025-12-01', '2025-12-31')"
    );
    // exam_session: id=100 (fin), id=101 (swe) — both share exam_date 100
    jdbcTemplate.update(
      "INSERT INTO exam_session (id, language_code, level_code, exam_date_id, max_participants) VALUES (100, 'fin', 'KESKI', 100, 30)"
    );
    jdbcTemplate.update(
      "INSERT INTO exam_session (id, language_code, level_code, exam_date_id, max_participants) VALUES (101, 'swe', 'KESKI', 100, 30)"
    );

    // registration 100: COMPLETED, fin, SSN match, person_oid='person1'
    jdbcTemplate.update(
      "INSERT INTO registration (id, state, exam_session_id, form, person_oid) VALUES (100, 'COMPLETED', 100, '{\"ssn\":\"010675-9981\",\"birthdate\":\"1975-06-01\"}'::jsonb, 'person1')"
    );
    // registration 101: SUBMITTED, fin, birthdate-only match (no ssn in form), person_oid='person2'
    jdbcTemplate.update(
      "INSERT INTO registration (id, state, exam_session_id, form, person_oid) VALUES (101, 'SUBMITTED', 100, '{\"birthdate\":\"1980-02-15\"}'::jsonb, 'person2')"
    );
    // registration 102: STARTED — should be filtered out
    jdbcTemplate.update(
      "INSERT INTO registration (id, state, exam_session_id, form) VALUES (102, 'STARTED', 100, '{\"ssn\":\"010675-9981\"}'::jsonb)"
    );
    // registration 103: COMPLETED, swe — language mismatch with fin quarantine
    jdbcTemplate.update(
      "INSERT INTO registration (id, state, exam_session_id, form) VALUES (103, 'COMPLETED', 101, '{\"ssn\":\"010675-9981\"}'::jsonb)"
    );
    // registration 104: COMPLETED, fin, SSN match — will have a reviewed quarantine_review
    jdbcTemplate.update(
      "INSERT INTO registration (id, state, exam_session_id, form, person_oid) VALUES (104, 'COMPLETED', 100, '{\"ssn\":\"100100-960R\"}'::jsonb, 'person3')"
    );

    // quarantine 100: fin, SSN=010675-9981, covers exam_date 2026-05-09
    jdbcTemplate.update(
      "INSERT INTO quarantine (id, language_code, ssn, birthdate, first_name, last_name, start_date, end_date, updated) VALUES (100, 'fin', '010675-9981', '1975-06-01', 'Anna-Liisa', 'Sallinen', '2026-01-01', '2026-12-31', '2020-01-01 00:00:00+00')"
    );
    // quarantine 101: fin, birthdate-only match with registration 101
    jdbcTemplate.update(
      "INSERT INTO quarantine (id, language_code, ssn, birthdate, first_name, last_name, start_date, end_date) VALUES (101, 'fin', null, '1980-02-15', 'Test', 'Person', '2026-01-01', '2026-12-31')"
    );
    // quarantine 102: fin, SSN match with registration 104 — will be reviewed
    jdbcTemplate.update(
      "INSERT INTO quarantine (id, language_code, ssn, birthdate, first_name, last_name, start_date, end_date, updated) VALUES (102, 'fin', '100100-960R', '1910-01-10', 'Reviewed', 'Person', '2026-01-01', '2026-12-31', '2020-01-01 00:00:00+00')"
    );

    // quarantine_review for quarantine 102 / registration 104 — updated is newer than quarantine.updated
    jdbcTemplate.update(
      "INSERT INTO quarantine_review (id, quarantine_id, registration_id, quarantined, reviewer_oid, updated) VALUES (1, 102, 104, true, 'reviewer1', CURRENT_TIMESTAMP)"
    );
  }

  @Test
  public void testOnlySubmittedAndCompletedRegistrationsAppear() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final ClerkQuarantineMatchesResponseDTO response = clerkQuarantineService.getQuarantineMatches();

    // registration 102 (STARTED) must not appear
    final boolean hasStarted = response.quarantineMatches().stream().anyMatch(m -> m.registrationId().equals(102L));
    assertEquals(false, hasStarted);
  }

  @Test
  public void testLanguageCodeMustMatch() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final ClerkQuarantineMatchesResponseDTO response = clerkQuarantineService.getQuarantineMatches();

    // registration 103 is in swe session but quarantine 100 is fin — no match
    final boolean hasSweMismatch = response.quarantineMatches().stream().anyMatch(m -> m.registrationId().equals(103L));
    assertEquals(false, hasSweMismatch);
  }

  @Test
  public void testSsnMatchTriggersResult() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final ClerkQuarantineMatchesResponseDTO response = clerkQuarantineService.getQuarantineMatches();

    final boolean hasSsnMatch = response.quarantineMatches().stream().anyMatch(m -> m.registrationId().equals(100L));
    assertEquals(true, hasSsnMatch);
  }

  @Test
  public void testBirthdateMatchTriggersResult() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final ClerkQuarantineMatchesResponseDTO response = clerkQuarantineService.getQuarantineMatches();

    final boolean hasBirthdateMatch = response
      .quarantineMatches()
      .stream()
      .anyMatch(m -> m.registrationId().equals(101L));
    assertEquals(true, hasBirthdateMatch);
  }

  @Test
  public void testAlreadyReviewedPairsAreExcluded() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final ClerkQuarantineMatchesResponseDTO response = clerkQuarantineService.getQuarantineMatches();

    // quarantine 102 / registration 104 has a newer review — must be excluded
    final boolean hasReviewedPair = response
      .quarantineMatches()
      .stream()
      .anyMatch(m -> m.registrationId().equals(104L));
    assertEquals(false, hasReviewedPair);
  }

  @Test
  public void testFormSsnIsOverwrittenWithOnrSsn() throws Exception {
    final PersonalDataDTO person1 = new PersonalDataDTO();
    person1.setOidHenkilo("person1");
    person1.setIdentityNumber("NEW-SSN-FROM-ONR");
    when(onrService.listPersonDetails(any())).thenReturn(List.of(person1));

    final ClerkQuarantineMatchesResponseDTO response = clerkQuarantineService.getQuarantineMatches();

    final ClerkQuarantineMatchDTO match = response
      .quarantineMatches()
      .stream()
      .filter(m -> m.registrationId().equals(100L))
      .findFirst()
      .orElseThrow();

    assertEquals("NEW-SSN-FROM-ONR", match.form().get("ssn").asText());
  }

  @Test
  public void testFormBirthdateIsPopulatedWhenAbsentUsingOriginalFormSsn() throws Exception {
    // registration 101 has birthdate-only match; form has no ssn → birthdate stays absent for this case
    // Use a separate registration with ssn but no birthdate in form
    jdbcTemplate.update(
      "INSERT INTO registration (id, state, exam_session_id, form, person_oid) VALUES (200, 'COMPLETED', 100, '{\"ssn\":\"010675-9981\"}'::jsonb, 'person4')"
    );

    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final ClerkQuarantineMatchesResponseDTO response = clerkQuarantineService.getQuarantineMatches();

    final ClerkQuarantineMatchDTO match = response
      .quarantineMatches()
      .stream()
      .filter(m -> m.registrationId().equals(200L))
      .findFirst()
      .orElseThrow();

    // birthdate should be computed from original form.ssn (010675-9981 → 1975-06-01)
    assertEquals("1975-06-01", match.form().get("birthdate").asText());
  }

  @Test
  public void testFormSsnIsNullWhenPersonNotInOnr() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final ClerkQuarantineMatchesResponseDTO response = clerkQuarantineService.getQuarantineMatches();

    final ClerkQuarantineMatchDTO match = response
      .quarantineMatches()
      .stream()
      .filter(m -> m.registrationId().equals(100L))
      .findFirst()
      .orElseThrow();

    // person1 not in ONR response → form.ssn should be JSON null
    assertTrue(match.form().get("ssn").isNull());
  }
}
