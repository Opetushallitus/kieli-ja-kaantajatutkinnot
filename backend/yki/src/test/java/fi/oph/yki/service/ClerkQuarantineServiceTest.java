package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Quarantine;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.QuarantineRepository;
import fi.oph.yki.repository.QuarantineReviewRepository;
import fi.oph.yki.repository.RegistrationRepository;
import jakarta.annotation.Resource;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
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
  private RegistrationRepository registrationRepository;

  @Resource
  private QuarantineRepository quarantineRepository;

  @Resource
  private QuarantineReviewRepository quarantineReviewRepository;

  @Resource
  private TestEntityManager entityManager;

  // Kept for quarantine_review inserts only — QuarantineReview has no JPA entity and we decided
  // against adding one that would be used exclusively in tests.
  @Resource
  private JdbcTemplate jdbcTemplate;

  @MockBean
  private OnrService onrService;

  @MockBean
  private AuditService auditService;

  private final ObjectMapper objectMapper = new ObjectMapper();

  private ClerkQuarantineService clerkQuarantineService;

  private ExamSession finSession;
  private Registration regSsnMatch;
  private Registration regBirthdateMatch;
  private Registration regStarted;
  private Registration regSweMismatch;
  private Registration regReviewed;

  @BeforeEach
  public void setup() {
    clerkQuarantineService =
      new ClerkQuarantineService(
        quarantineRepository,
        registrationRepository,
        quarantineReviewRepository,
        onrService,
        auditService,
        objectMapper
      );

    final ExamDate examDate = Factory.examDate();
    entityManager.persist(examDate);

    finSession = Factory.examSession(examDate);
    entityManager.persist(finSession);

    final ExamSession sweSession = Factory.examSession(examDate);
    sweSession.setLanguage("swe");
    entityManager.persist(sweSession);

    final Person person1 = Factory.person();
    person1.setOid("oid-person1");
    entityManager.persist(person1);

    final Person person2 = Factory.person();
    person2.setOid("oid-person2");
    entityManager.persist(person2);

    final Person person3 = Factory.person();
    person3.setOid("oid-person3");
    entityManager.persist(person3);

    // COMPLETED, fin, SSN match
    regSsnMatch = Factory.registration(person1);
    regSsnMatch.setExamSession(finSession);
    regSsnMatch.setState(RegistrationState.COMPLETED);
    regSsnMatch.setForm(objectMapper.createObjectNode().put("ssn", "010675-9981").put("birthdate", "1975-06-01"));
    entityManager.persist(regSsnMatch);

    // SUBMITTED, fin, birthdate-only match (no ssn in form)
    regBirthdateMatch = Factory.registration(person2);
    regBirthdateMatch.setExamSession(finSession);
    regBirthdateMatch.setForm(objectMapper.createObjectNode().put("birthdate", "1980-02-15"));
    entityManager.persist(regBirthdateMatch);

    // STARTED — should be filtered out
    regStarted = Factory.registration(null);
    regStarted.setExamSession(finSession);
    regStarted.setState(RegistrationState.STARTED);
    regStarted.setForm(objectMapper.createObjectNode().put("ssn", "010675-9981"));
    entityManager.persist(regStarted);

    // COMPLETED, swe — language mismatch with fin quarantine
    regSweMismatch = Factory.registration(null);
    regSweMismatch.setExamSession(sweSession);
    regSweMismatch.setState(RegistrationState.COMPLETED);
    regSweMismatch.setForm(objectMapper.createObjectNode().put("ssn", "010675-9981"));
    entityManager.persist(regSweMismatch);

    // COMPLETED, fin — will have a reviewed quarantine_review
    regReviewed = Factory.registration(person3);
    regReviewed.setExamSession(finSession);
    regReviewed.setState(RegistrationState.COMPLETED);
    regReviewed.setForm(objectMapper.createObjectNode().put("ssn", "100100-960R"));
    entityManager.persist(regReviewed);

    // fin, SSN=010675-9981, covers Factory.examDate() date
    final Quarantine quarantineSsn = Factory.quarantine();
    quarantineSsn.setSsn("010675-9981");
    quarantineSsn.setBirthdate("1975-06-01");
    quarantineSsn.setFirstName("Anna-Liisa");
    quarantineSsn.setLastName("Sallinen");
    quarantineSsn.setUpdated(Instant.parse("2020-01-01T00:00:00Z"));
    entityManager.persist(quarantineSsn);

    // fin, birthdate-only match
    final Quarantine quarantineBirthdate = Factory.quarantine();
    quarantineBirthdate.setSsn(null);
    quarantineBirthdate.setBirthdate("1980-02-15");
    entityManager.persist(quarantineBirthdate);

    // fin, SSN match with regReviewed — will be reviewed
    final Quarantine quarantineReviewed = Factory.quarantine();
    quarantineReviewed.setSsn("100100-960R");
    quarantineReviewed.setBirthdate("1910-01-10");
    quarantineReviewed.setFirstName("Reviewed");
    quarantineReviewed.setLastName("Person");
    quarantineReviewed.setUpdated(Instant.parse("2020-01-01T00:00:00Z"));
    entityManager.persist(quarantineReviewed);

    entityManager.flush();

    // quarantine_review — raw SQL: QuarantineReview has no JPA entity and we decided against
    // adding one that would be used exclusively in tests.
    jdbcTemplate.update(
      "INSERT INTO quarantine_review (quarantine_id, registration_id, quarantined, reviewer_oid) VALUES (?, ?, true, 'reviewer1')",
      quarantineReviewed.getId(),
      regReviewed.getId()
    );
  }

  @Test
  public void testOnlySubmittedAndCompletedRegistrationsAppear() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final List<ClerkQuarantineMatchDTO> response = clerkQuarantineService.getQuarantineMatches();

    assertFalse(response.stream().anyMatch(m -> m.registrationId().equals(regStarted.getId())));
  }

  @Test
  public void testLanguageCodeMustMatch() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final List<ClerkQuarantineMatchDTO> response = clerkQuarantineService.getQuarantineMatches();

    assertFalse(response.stream().anyMatch(m -> m.registrationId().equals(regSweMismatch.getId())));
  }

  @Test
  public void testSsnMatchTriggersResult() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final List<ClerkQuarantineMatchDTO> response = clerkQuarantineService.getQuarantineMatches();

    assertTrue(response.stream().anyMatch(m -> m.registrationId().equals(regSsnMatch.getId())));
  }

  @Test
  public void testBirthdateMatchTriggersResult() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final List<ClerkQuarantineMatchDTO> response = clerkQuarantineService.getQuarantineMatches();

    assertTrue(response.stream().anyMatch(m -> m.registrationId().equals(regBirthdateMatch.getId())));
  }

  @Test
  public void testAlreadyReviewedPairsAreExcluded() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final List<ClerkQuarantineMatchDTO> response = clerkQuarantineService.getQuarantineMatches();

    assertFalse(response.stream().anyMatch(m -> m.registrationId().equals(regReviewed.getId())));
  }

  @Test
  public void testFormSsnIsOverwrittenWithOnrSsn() throws Exception {
    final PersonalDataDTO person1Dto = new PersonalDataDTO();
    person1Dto.setOidHenkilo("oid-person1");
    person1Dto.setIdentityNumber("NEW-SSN-FROM-ONR");
    when(onrService.listPersonDetails(any())).thenReturn(List.of(person1Dto));

    final List<ClerkQuarantineMatchDTO> response = clerkQuarantineService.getQuarantineMatches();

    final ClerkQuarantineMatchDTO match = response
      .stream()
      .filter(m -> m.registrationId().equals(regSsnMatch.getId()))
      .findFirst()
      .orElseThrow();

    assertEquals("NEW-SSN-FROM-ONR", match.form().get("ssn").asText());
  }

  @Test
  public void testFormBirthdateIsPopulatedWhenAbsentUsingOriginalFormSsn() throws Exception {
    final Person person4 = Factory.person();
    person4.setOid("oid-person4");
    entityManager.persist(person4);

    // Registration with SSN in form but no birthdate — birthdate should be derived from the SSN
    final Registration regNoBirthdate = Factory.registration(person4);
    regNoBirthdate.setExamSession(finSession);
    regNoBirthdate.setState(RegistrationState.COMPLETED);
    regNoBirthdate.setForm(objectMapper.createObjectNode().put("ssn", "010675-9981"));
    entityManager.persistAndFlush(regNoBirthdate);

    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final List<ClerkQuarantineMatchDTO> response = clerkQuarantineService.getQuarantineMatches();

    final ClerkQuarantineMatchDTO match = response
      .stream()
      .filter(m -> m.registrationId().equals(regNoBirthdate.getId()))
      .findFirst()
      .orElseThrow();

    // birthdate derived from original form.ssn (010675-9981 → 1975-06-01)
    assertEquals("1975-06-01", match.form().get("birthdate").asText());
  }

  @Test
  public void testFormSsnIsNullWhenPersonNotInOnr() throws Exception {
    when(onrService.listPersonDetails(any())).thenReturn(List.of());

    final List<ClerkQuarantineMatchDTO> response = clerkQuarantineService.getQuarantineMatches();

    final ClerkQuarantineMatchDTO match = response
      .stream()
      .filter(m -> m.registrationId().equals(regSsnMatch.getId()))
      .findFirst()
      .orElseThrow();

    // person not in ONR response → form.ssn should be JSON null
    assertTrue(match.form().get("ssn").isNull());
  }
}
