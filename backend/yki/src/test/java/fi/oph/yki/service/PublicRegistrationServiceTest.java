package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.PublicRegistrationInitDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitResponseDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
public class PublicRegistrationServiceTest {

  @Resource
  private RegistrationRepository registrationRepository;

  @Resource
  private ExamSessionRepository examSessionRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicRegistrationService publicRegistrationService;

  @BeforeEach
  public void setup() {
    publicRegistrationService = new PublicRegistrationService(registrationRepository, examSessionRepository);
  }

  private ExamDate openExamDate() {
    final ExamDate examDate = Factory.examDate();
    examDate.setRegistrationStartDate(LocalDate.now().minusDays(10));
    examDate.setRegistrationEndDate(LocalDate.now().plusDays(10));

    return examDate;
  }

  private ExamDate closedExamDate() {
    final ExamDate examDate = Factory.examDate();
    examDate.setRegistrationStartDate(LocalDate.now().minusDays(30));
    examDate.setRegistrationEndDate(LocalDate.now().minusDays(1));

    return examDate;
  }

  private Identity persistIdentity() {
    final Identity identity = new Identity();
    identity.setCreatedAt(LocalDateTime.now());
    identity.setModifiedAt(LocalDateTime.now());
    entityManager.persist(identity);

    return identity;
  }

  private PublicRegistrationInitDTO initDTO(final long examSessionId, final PartialExamType partialExamType) {
    return PublicRegistrationInitDTO.builder().examSessionId(examSessionId).partialExamType(partialExamType).build();
  }

  private PublicRegistrationInitDTO initDTO(
    final long examSessionId,
    final PartialExamType partialExamType,
    final boolean toQueue
  ) {
    return PublicRegistrationInitDTO
      .builder()
      .examSessionId(examSessionId)
      .partialExamType(partialExamType)
      .toQueue(toQueue)
      .build();
  }

  @Test
  public void testInitRegistrationSuccess() {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final Identity identity = persistIdentity();

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.flush();
    entityManager.clear();

    final PublicRegistrationInitResponseDTO result = publicRegistrationService.initRegistration(
      identity,
      initDTO(examSession.getId(), PartialExamType.ALL_PARTS)
    );

    assertNotNull(result);
    assertEquals(examSession.getId(), result.examSession().id());
    assertEquals(RegistrationKind.ADMISSION, result.registrationKind());
    assertEquals(PartialExamType.ALL_PARTS, result.partialExamType());
  }

  @Test
  public void testInitRegistrationExamSessionNotFound() {
    final Identity identity = persistIdentity();
    entityManager.flush();

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicRegistrationService.initRegistration(identity, initDTO(99999L, PartialExamType.ALL_PARTS))
    );
    assertEquals(APIExceptionType.NOT_FOUND, ex.getExceptionType());
  }

  @Test
  public void testInitRegistrationClosed() {
    final ExamDate examDate = closedExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final Identity identity = persistIdentity();

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.flush();
    entityManager.clear();

    final APIException ex = assertThrows(
      APIException.class,
      () ->
        publicRegistrationService.initRegistration(identity, initDTO(examSession.getId(), PartialExamType.ALL_PARTS))
    );
    assertEquals(APIExceptionType.REGISTRATION_CLOSED, ex.getExceptionType());
  }

  @Test
  public void testInitRegistrationInvalidPartialExamTypeForFullSession() {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final Identity identity = persistIdentity();

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.flush();
    entityManager.clear();

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicRegistrationService.initRegistration(identity, initDTO(examSession.getId(), PartialExamType.READ))
    );
    assertEquals(APIExceptionType.REGISTRATION_INVALID_PARTIAL_EXAM_TYPE, ex.getExceptionType());
  }

  @Test
  public void testInitRegistrationInvalidPartialExamTypeForReadSpeakSession() {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setType(ExamSessionType.READ_SPEAK);
    examSession.setMaxParticipantsReadListen(10);
    examSession.setMaxParticipantsSpeakWrite(10);
    final Identity identity = persistIdentity();

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.flush();
    entityManager.clear();

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicRegistrationService.initRegistration(identity, initDTO(examSession.getId(), PartialExamType.LISTEN))
    );
    assertEquals(APIExceptionType.REGISTRATION_INVALID_PARTIAL_EXAM_TYPE, ex.getExceptionType());
  }

  @Test
  public void testInitRegistrationConflictOnSameExamDate() {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession1 = Factory.examSession(examDate);
    final ExamSession examSession2 = Factory.examSession(examDate);
    examSession2.setLanguage("swe");
    final Identity identity = persistIdentity();

    entityManager.persist(examDate);
    entityManager.persist(examSession1);
    entityManager.persist(examSession2);

    final Registration existing = new Registration();
    existing.setExamSession(examSession1);
    existing.setIdentity(identity);
    existing.setState(RegistrationState.STARTED);
    existing.setKind(RegistrationKind.ADMISSION);
    existing.setPartialExamType(PartialExamType.ALL_PARTS);
    existing.setCreatedAt(LocalDateTime.now());
    entityManager.persist(existing);
    entityManager.flush();
    entityManager.clear();

    final APIException ex = assertThrows(
      APIException.class,
      () ->
        publicRegistrationService.initRegistration(identity, initDTO(examSession2.getId(), PartialExamType.ALL_PARTS))
    );
    assertEquals(APIExceptionType.REGISTRATION_CONFLICT, ex.getExceptionType());
  }

  @Test
  public void testInitRegistrationNoConflictForDifferentPartialExamsInSameSession() {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setType(ExamSessionType.READ_SPEAK);
    examSession.setMaxParticipantsReadListen(10);
    examSession.setMaxParticipantsSpeakWrite(10);
    final Identity identity = persistIdentity();

    entityManager.persist(examDate);
    entityManager.persist(examSession);

    final Registration existing = new Registration();
    existing.setExamSession(examSession);
    existing.setIdentity(identity);
    existing.setState(RegistrationState.STARTED);
    existing.setKind(RegistrationKind.ADMISSION);
    existing.setPartialExamType(PartialExamType.READ);
    existing.setCreatedAt(LocalDateTime.now());
    entityManager.persist(existing);
    entityManager.flush();
    entityManager.clear();

    final PublicRegistrationInitResponseDTO result = publicRegistrationService.initRegistration(
      identity,
      initDTO(examSession.getId(), PartialExamType.SPEAK)
    );

    assertNotNull(result);
    assertEquals(PartialExamType.SPEAK, result.partialExamType());
    assertEquals(RegistrationKind.ADMISSION, result.registrationKind());
  }

  @Test
  public void testInitRegistrationFullSessionQueuesWhenFull() {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setMaxParticipants(1);
    final Identity identity1 = persistIdentity();
    final Identity identity2 = persistIdentity();

    entityManager.persist(examDate);
    entityManager.persist(examSession);

    final Registration existing = new Registration();
    existing.setExamSession(examSession);
    existing.setIdentity(identity1);
    existing.setState(RegistrationState.COMPLETED);
    existing.setKind(RegistrationKind.ADMISSION);
    existing.setPartialExamType(PartialExamType.ALL_PARTS);
    existing.setCreatedAt(LocalDateTime.now());
    entityManager.persist(existing);
    entityManager.flush();
    entityManager.clear();

    final PublicRegistrationInitResponseDTO result = publicRegistrationService.initRegistration(
      identity2,
      initDTO(examSession.getId(), PartialExamType.ALL_PARTS, true)
    );

    assertNotNull(result);
    assertEquals(RegistrationKind.QUEUE, result.registrationKind());
  }

  @Test
  public void testInitRegistrationThrowsFullWhenNotRequestingQueue() {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setMaxParticipants(1);
    final Identity identity1 = persistIdentity();
    final Identity identity2 = persistIdentity();

    entityManager.persist(examDate);
    entityManager.persist(examSession);

    final Registration existing = new Registration();
    existing.setExamSession(examSession);
    existing.setIdentity(identity1);
    existing.setState(RegistrationState.COMPLETED);
    existing.setKind(RegistrationKind.ADMISSION);
    existing.setPartialExamType(PartialExamType.ALL_PARTS);
    existing.setCreatedAt(LocalDateTime.now());
    entityManager.persist(existing);
    entityManager.flush();
    entityManager.clear();

    final APIException ex = assertThrows(
      APIException.class,
      () ->
        publicRegistrationService.initRegistration(
          identity2,
          initDTO(examSession.getId(), PartialExamType.ALL_PARTS, false)
        )
    );
    assertEquals(APIExceptionType.REGISTRATION_FULL, ex.getExceptionType());
  }

  @Test
  public void testInitRegistrationQueueNotAvailableWhenAdmissionOpen() {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final Identity identity = persistIdentity();

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.flush();
    entityManager.clear();

    final APIException ex = assertThrows(
      APIException.class,
      () ->
        publicRegistrationService.initRegistration(
          identity,
          initDTO(examSession.getId(), PartialExamType.ALL_PARTS, true)
        )
    );
    assertEquals(APIExceptionType.REGISTRATION_QUEUE_NOT_AVAILABLE, ex.getExceptionType());
  }

  @Test
  public void testInitRegistrationCreatesStartedRegistration() {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final Identity identity = persistIdentity();

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.flush();
    entityManager.clear();

    final PublicRegistrationInitResponseDTO result = publicRegistrationService.initRegistration(
      identity,
      initDTO(examSession.getId(), PartialExamType.ALL_PARTS)
    );

    final Registration saved = registrationRepository.getReferenceById(result.registrationId());
    assertEquals(RegistrationState.STARTED, saved.getState());
    assertEquals(RegistrationKind.ADMISSION, saved.getKind());
    assertEquals(PartialExamType.ALL_PARTS, saved.getPartialExamType());
    assertEquals(identity.getId(), saved.getIdentity().getId());
  }

  @Test
  public void testInitRegistrationPartialSessionReadSpeak() {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setType(ExamSessionType.READ_SPEAK);
    examSession.setMaxParticipantsReadListen(10);
    examSession.setMaxParticipantsSpeakWrite(10);
    final Identity identity = persistIdentity();

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.flush();
    entityManager.clear();

    final PublicRegistrationInitResponseDTO result = publicRegistrationService.initRegistration(
      identity,
      initDTO(examSession.getId(), PartialExamType.READ)
    );

    assertNotNull(result);
    assertEquals(PartialExamType.READ, result.partialExamType());
    assertEquals(RegistrationKind.ADMISSION, result.registrationKind());
  }
}
