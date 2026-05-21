package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchDTO;
import fi.oph.yki.api.dto.clerk.ClerkQuarantineReviewDTO;
import fi.oph.yki.api.dto.clerk.CreateQuarantineRequest;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
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
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
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
        auditService
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
    quarantineSsn.setUpdated(LocalDateTime.of(2020, Month.JANUARY, 1, 0, 0));
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
    quarantineSsn.setUpdated(LocalDateTime.of(2020, Month.JANUARY, 1, 0, 0));
    entityManager.persist(quarantineReviewed);

    entityManager.flush();

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

    assertEquals("NEW-SSN-FROM-ONR", match.registrant().ssn());
  }

  @Test
  public void testGetReviewsReturnsCompletedReview() {
    final List<ClerkQuarantineReviewDTO> reviews = clerkQuarantineService.getReviews();

    assertEquals(1, reviews.size());
    final ClerkQuarantineReviewDTO review = reviews.get(0);
    assertTrue(review.quarantined());
    assertEquals(regReviewed.getId(), review.registrationId());
    assertEquals("Reviewed", review.quarantinedPerson().firstName());
    assertEquals("Person", review.quarantinedPerson().lastName());
  }

  @Test
  public void testGetReviewsDoesNotIncludePendingMatches() {
    final List<ClerkQuarantineReviewDTO> reviews = clerkQuarantineService.getReviews();

    assertFalse(reviews.stream().anyMatch(r -> r.registrationId().equals(regSsnMatch.getId())));
    assertFalse(reviews.stream().anyMatch(r -> r.registrationId().equals(regBirthdateMatch.getId())));
  }

  @Test
  public void testGetReviewsRegistrantBirthdateIsNullWhenAbsentFromForm() {
    final List<ClerkQuarantineReviewDTO> reviews = clerkQuarantineService.getReviews();

    final ClerkQuarantineReviewDTO review = reviews.get(0);
    assertNull(review.registrant().birthdate());
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

    assertTrue(match.registrant().ssn() == null || match.registrant().ssn().isEmpty());
  }

  @Test
  public void testCreateQuarantineWithSsnOnlyDerivesBirthdate() {
    final CreateQuarantineRequest request = new CreateQuarantineRequest(
      "fin",
      LocalDate.of(2026, 1, 1),
      LocalDate.of(2026, 12, 31),
      "Testi",
      "Henkilö",
      "DIARYNO-001",
      null,
      "010675-9981",
      null,
      null
    );

    clerkQuarantineService.createQuarantine(request);

    final Quarantine saved = quarantineRepository
      .findAll()
      .stream()
      .filter(q -> "DIARYNO-001".equals(q.getDiaryNumber()))
      .findFirst()
      .orElseThrow();
    assertEquals("1975-06-01", saved.getBirthdate());
    assertEquals("010675-9981", saved.getSsn());
  }

  @Test
  public void testCreateQuarantineWithBirthdateOnlyStoresDate() {
    final CreateQuarantineRequest request = new CreateQuarantineRequest(
      "fin",
      LocalDate.of(2026, 1, 1),
      LocalDate.of(2026, 12, 31),
      "Testi",
      "Henkilö",
      "DIARYNO-002",
      LocalDate.of(2000, 1, 15),
      null,
      null,
      null
    );

    clerkQuarantineService.createQuarantine(request);

    final Quarantine saved = quarantineRepository
      .findAll()
      .stream()
      .filter(q -> "DIARYNO-002".equals(q.getDiaryNumber()))
      .findFirst()
      .orElseThrow();
    assertEquals("2000-01-15", saved.getBirthdate());
    assertNull(saved.getSsn());
  }

  @Test
  public void testCreateQuarantineWithMatchingSsnAndBirthdateSaves() {
    final CreateQuarantineRequest request = new CreateQuarantineRequest(
      "fin",
      LocalDate.of(2026, 1, 1),
      LocalDate.of(2026, 12, 31),
      "Testi",
      "Henkilö",
      "DIARYNO-003",
      LocalDate.of(1975, 6, 1),
      "010675-9981",
      null,
      null
    );

    clerkQuarantineService.createQuarantine(request);

    final Quarantine saved = quarantineRepository
      .findAll()
      .stream()
      .filter(q -> "DIARYNO-003".equals(q.getDiaryNumber()))
      .findFirst()
      .orElseThrow();
    assertEquals("1975-06-01", saved.getBirthdate());
  }

  @Test
  public void testCreateQuarantineThrowsWhenSsnAndBirthdateMismatch() {
    final CreateQuarantineRequest request = new CreateQuarantineRequest(
      "fin",
      LocalDate.of(2026, 1, 1),
      LocalDate.of(2026, 12, 31),
      "Testi",
      "Henkilö",
      "DIARYNO-004",
      LocalDate.of(1990, 1, 1),
      "010675-9981",
      null,
      null
    );

    final APIException ex = assertThrows(APIException.class, () -> clerkQuarantineService.createQuarantine(request));
    assertEquals(APIExceptionType.QUARANTINE_SSN_BIRTHDATE_MISMATCH, ex.getExceptionType());
  }

  @Test
  public void testCreateQuarantineThrowsWhenNeitherSsnNorBirthdate() {
    final CreateQuarantineRequest request = new CreateQuarantineRequest(
      "fin",
      LocalDate.of(2026, 1, 1),
      LocalDate.of(2026, 12, 31),
      "Testi",
      "Henkilö",
      "DIARYNO-005",
      null,
      null,
      null,
      null
    );

    final APIException ex = assertThrows(APIException.class, () -> clerkQuarantineService.createQuarantine(request));
    assertEquals(APIExceptionType.QUARANTINE_MISSING_SSN_AND_BIRTHDATE, ex.getExceptionType());
  }

  @Test
  public void testCreateQuarantineThrowsWhenSsnIsInvalid() {
    final CreateQuarantineRequest request = new CreateQuarantineRequest(
      "fin",
      LocalDate.of(2026, 1, 1),
      LocalDate.of(2026, 12, 31),
      "Testi",
      "Henkilö",
      "DIARYNO-006",
      null,
      "000000-0000",
      null,
      null
    );

    final APIException ex = assertThrows(APIException.class, () -> clerkQuarantineService.createQuarantine(request));
    assertEquals(APIExceptionType.QUARANTINE_INVALID_SSN, ex.getExceptionType());
  }

  @Test
  public void testCreateQuarantineLogsAudit() {
    final CreateQuarantineRequest request = new CreateQuarantineRequest(
      "fin",
      LocalDate.of(2026, 1, 1),
      LocalDate.of(2026, 12, 31),
      "Testi",
      "Henkilö",
      "DIARYNO-007",
      LocalDate.of(2000, 1, 15),
      null,
      null,
      null
    );

    clerkQuarantineService.createQuarantine(request);

    verify(auditService).logClerkById(eq(YkiOperation.CREATE_QUARANTINE), anyString());
  }
}
