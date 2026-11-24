package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.PublicRegistrationDetailsDTO;
import fi.oph.yki.api.dto.PublicRegistrationFormDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitResponseDTO;
import fi.oph.yki.api.dto.PublicRegistrationSubmitResponseDTO;
import fi.oph.yki.api.dto.PublicRegistrationUserDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.PaymentLink;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.RegistrationChangeEvent;
import fi.oph.yki.model.RegistrationLoginLink;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.IdentityAuthMethod;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.IdentityRepository;
import fi.oph.yki.repository.PaymentLinkRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationChangeEventRepository;
import fi.oph.yki.repository.RegistrationLoginLinkRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.StringUtil;
import fi.oph.yki.util.UUIDSource;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

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
  private IdentityRepository identityRepository;

  @Resource
  private PersonRepository personRepository;

  @Resource
  private PaymentLinkRepository paymentLinkRepository;

  @Resource
  private RegistrationChangeEventRepository registrationChangeEventRepository;

  @Resource
  private RegistrationLoginLinkRepository registrationLoginLinkRepository;

  private void assertSubmitChangeEvent(
    final Registration registration,
    final RegistrationState state,
    final RegistrationKind kind,
    final String createdBy
  ) {
    final List<RegistrationChangeEvent> events = registrationChangeEventRepository.findAll();
    assertEquals(1, events.size());
    final RegistrationChangeEvent event = events.get(0);
    assertEquals("SUBMIT", event.getEvent());
    assertEquals(registration.getId(), event.getRegistrationId());
    assertEquals(registration.getExamSession().getId(), event.getExamSessionId());
    assertEquals(state, event.getRegistrationState());
    assertEquals(kind, event.getRegistrationKind());
    assertNull(event.getOriginalExamSessionId());
    assertEquals(createdBy, event.getCreatedBy());
    assertEquals("USER", event.getAuthorType());
    assertNotNull(event.getCreatedAt());
  }

  @Resource
  private TestEntityManager entityManager;

  private RegistrationEmailService registrationEmailService;

  @MockitoBean
  private OnrService onrService;

  private PublicRegistrationService publicRegistrationService;

  @BeforeEach
  public void setup() {
    registrationEmailService = mock(RegistrationEmailService.class);
    publicRegistrationService =
      new PublicRegistrationService(
        registrationRepository,
        registrationChangeEventRepository,
        examSessionRepository,
        identityRepository,
        personRepository,
        new PaymentLinkService(paymentLinkRepository, new UUIDSource()),
        new RegistrationLoginLinkService(registrationLoginLinkRepository, new UUIDSource()),
        registrationEmailService,
        onrService
      );
  }

  private PublicRegistrationFormDTO formDTO(final Long freeRegistrationId) {
    return PublicRegistrationFormDTO
      .builder()
      .firstName("Testi")
      .lastName("Henkilö")
      .nationalities(List.of("246"))
      .certificateLang("fi")
      .examLang("fi")
      .postOffice("Helsinki")
      .zip("00100")
      .streetAddress("Testikatu 1")
      .phoneNumber("0401234567")
      .email("testi@example.com")
      .freeRegistrationId(freeRegistrationId)
      .build();
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
    final Identity identity = Factory.identity();
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

  private Registration savedRegistration(final PublicRegistrationInitResponseDTO result) {
    assertNull(result.error());
    assertNotNull(result.registrationId());

    return registrationRepository.findById(result.registrationId()).orElseThrow();
  }

  private ExamSession persistReadSpeakSession(final int maxReadListen, final int maxSpeakWrite) {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setType(ExamSessionType.READ_SPEAK);
    examSession.setMaxParticipants(maxReadListen + maxSpeakWrite);
    examSession.setMaxParticipantsReadListen(maxReadListen);
    examSession.setMaxParticipantsSpeakWrite(maxSpeakWrite);
    entityManager.persist(examDate);
    entityManager.persist(examSession);

    return examSession;
  }

  private void persistAdmission(final ExamSession examSession, final PartialExamType partialExamType) {
    final Registration registration = new Registration();
    registration.setExamSession(examSession);
    registration.setIdentity(persistIdentity());
    registration.setState(RegistrationState.COMPLETED);
    registration.setKind(RegistrationKind.ADMISSION);
    registration.setPartialExamType(partialExamType);
    registration.setCreatedAt(LocalDateTime.now());
    entityManager.persist(registration);
  }

  private Registration persistStartedRegistration(final Identity identity, final Person person) {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setOrganizer(entityManager.persist(Factory.organizer()));
    entityManager.persist(examDate);
    entityManager.persist(examSession);

    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setIdentity(identity);
    registration.setState(RegistrationState.STARTED);
    registration.setStrongAuth(person != null);
    registration.setCreatedAt(LocalDateTime.now());
    entityManager.persist(registration);
    entityManager.flush();
    entityManager.clear();

    return registration;
  }

  @Test
  public void testSubmitRegistrationCreatesPaymentLink() {
    final Identity identity = persistIdentity();
    final Person person = entityManager.persist(Factory.person());
    final Registration registration = persistStartedRegistration(identity, person);

    final PublicRegistrationSubmitResponseDTO result = publicRegistrationService.submitRegistration(
      identity,
      registration.getId(),
      "fi",
      formDTO(null)
    );

    assertEquals(RegistrationState.SUBMITTED, result.state());
    assertNotNull(result.code());
    final List<PaymentLink> paymentLinks = paymentLinkRepository.findAll();
    assertEquals(1, paymentLinks.size());
    final PaymentLink paymentLink = paymentLinks.get(0);
    assertEquals(StringUtil.sha256hex(result.code()), paymentLink.getCode());
    assertEquals(identity.getId(), paymentLink.getIdentity().getId());
    assertEquals(registration.getId(), paymentLink.getRegistration().getId());

    final LocalDateTime expiresAt = LocalDate.now().plusDays(4).atStartOfDay();
    assertEquals(expiresAt, paymentLink.getExpiresAt());
    final Registration submitted = registrationRepository.findById(registration.getId()).orElseThrow();
    assertEquals(expiresAt, submitted.getExpiresAt());
    verify(registrationEmailService).sendPaymentEmail(any(Registration.class), eq(result.code()), eq("fi"));
    assertSubmitChangeEvent(registration, RegistrationState.SUBMITTED, RegistrationKind.ADMISSION, null);
  }

  @Test
  public void testSubmitRegistrationChangeEventHasPersonOfIdentityAsAuthor() {
    final Person person = entityManager.persist(Factory.person());
    final Identity identity = persistIdentity();
    identity.setPerson(person);
    final Registration registration = persistStartedRegistration(identity, person);

    publicRegistrationService.submitRegistration(identity, registration.getId(), "fi", formDTO(null));

    assertSubmitChangeEvent(registration, RegistrationState.SUBMITTED, RegistrationKind.ADMISSION, person.getOid());
  }

  @Test
  public void testSubmitRegistrationOfOtherIdentityInsertsNoChangeEvent() {
    final Registration registration = persistStartedRegistration(persistIdentity(), null);
    final Identity otherIdentity = persistIdentity();

    assertThrows(
      APIException.class,
      () -> publicRegistrationService.submitRegistration(otherIdentity, registration.getId(), "fi", formDTO(null))
    );

    assertTrue(registrationChangeEventRepository.findAll().isEmpty());
  }

  @Test
  public void testSubmitRegistrationPaymentExpiresAtRegistrationEnd() {
    final Identity identity = persistIdentity();
    final Person person = entityManager.persist(Factory.person());
    final Registration registration = persistStartedRegistration(identity, person);
    final ExamDate examDate = registrationRepository
      .findById(registration.getId())
      .orElseThrow()
      .getExamSession()
      .getExamDate();
    examDate.setRegistrationEndDate(LocalDate.now().plusDays(1));
    entityManager.flush();

    publicRegistrationService.submitRegistration(identity, registration.getId(), "fi", formDTO(null));

    assertEquals(
      LocalDate.now().plusDays(2).atStartOfDay(),
      registrationRepository.findById(registration.getId()).orElseThrow().getExpiresAt()
    );
  }

  @Test
  public void testSubmitFreeRegistrationCreatesNoPaymentLink() {
    final Identity identity = persistIdentity();
    final Person person = entityManager.persist(Factory.person());
    final Registration registration = persistStartedRegistration(identity, person);

    final PublicRegistrationSubmitResponseDTO result = publicRegistrationService.submitRegistration(
      identity,
      registration.getId(),
      "fi",
      formDTO(1L)
    );

    assertEquals(RegistrationState.COMPLETED, result.state());
    assertNull(result.code());
    assertTrue(paymentLinkRepository.findAll().isEmpty());
    verify(registrationEmailService).sendFreeRegistrationEmail(any(Registration.class), eq("fi"));
    verifyNoMoreInteractions(registrationEmailService);
    assertSubmitChangeEvent(registration, RegistrationState.COMPLETED, RegistrationKind.ADMISSION, null);
  }

  @Test
  public void testSubmitQueueRegistrationCreatesNoPaymentLink() {
    final Identity identity = persistIdentity();
    final Person person = entityManager.persist(Factory.person());
    final Registration registration = persistStartedRegistration(identity, person);
    final Registration queueRegistration = registrationRepository.findById(registration.getId()).orElseThrow();
    queueRegistration.setKind(RegistrationKind.QUEUE);
    registrationRepository.saveAndFlush(queueRegistration);

    final PublicRegistrationSubmitResponseDTO result = publicRegistrationService.submitRegistration(
      identity,
      registration.getId(),
      "fi",
      formDTO(null)
    );

    assertEquals(RegistrationKind.QUEUE, result.registrationKind());
    assertNull(result.code());
    assertTrue(paymentLinkRepository.findAll().isEmpty());
    verify(registrationEmailService).sendEnrolledToQueueEmail(any(Registration.class), eq("fi"));
    verifyNoMoreInteractions(registrationEmailService);
    assertSubmitChangeEvent(registration, RegistrationState.SUBMITTED, RegistrationKind.QUEUE, null);
  }

  @Test
  public void testGetRegistrationDetailsIncludesPersonOfIdentity() {
    final Person person = Factory.person();
    person.setEmail("testi@example.com");
    person.setSteetAddress("Testikatu 1");
    person.setPostOffice("Helsinki");
    person.setZip("00100");
    person.setNationalityCode("246");
    entityManager.persist(person);
    final Identity identity = persistIdentity();
    identity.setPerson(person);
    final Registration registration = persistStartedRegistration(identity, person);

    final PublicRegistrationDetailsDTO result = publicRegistrationService.getRegistrationDetails(
      identity,
      registration.getId()
    );

    assertTrue(result.isStronglyIdentified());
    final PublicRegistrationUserDTO user = result.user();
    assertEquals("1.2.3.4.5", user.oid());
    assertEquals("Testi", user.firstName());
    assertEquals("Henkilö", user.lastName());
    assertEquals("testi@example.com", user.email());
    assertEquals("Testikatu 1", user.streetAddress());
    assertEquals("Helsinki", user.postOffice());
    assertEquals("00100", user.zip());
    assertEquals(List.of("246"), user.nationalities());
  }

  @Test
  public void testGetRegistrationDetailsWithoutPersonHasNoUser() {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity, null);

    final PublicRegistrationDetailsDTO result = publicRegistrationService.getRegistrationDetails(
      identity,
      registration.getId()
    );

    assertFalse(result.isStronglyIdentified());
    assertNull(result.user());
    assertNull(result.email());
  }

  @Test
  public void testGetRegistrationDetailsHasEmailFromForm() {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity, null);
    publicRegistrationService.setRegistrationEmailAuthDetails(registration, "testi@example.com");
    entityManager.flush();
    entityManager.clear();

    final PublicRegistrationDetailsDTO result = publicRegistrationService.getRegistrationDetails(
      identity,
      registration.getId()
    );

    assertEquals("testi@example.com", result.email());
    assertNull(result.user());
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

    final Registration saved = savedRegistration(result);
    assertEquals(examSession.getId(), saved.getExamSession().getId());
    assertEquals(RegistrationKind.ADMISSION, saved.getKind());
    assertEquals(PartialExamType.ALL_PARTS, saved.getPartialExamType());
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

    final var result = publicRegistrationService.initRegistration(
      identity,
      initDTO(examSession.getId(), PartialExamType.ALL_PARTS)
    );

    assertNull(result.registrationId());
    assertNotNull(result.error());
    assertTrue(result.error().closed());
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

    final var result = publicRegistrationService.initRegistration(
      identity,
      initDTO(examSession2.getId(), PartialExamType.ALL_PARTS)
    );

    assertNull(result.registrationId());
    assertNotNull(result.error());
    final var other = result.error().otherExamSessionRegistration();
    assertEquals(examSession1.getId(), other.id());
    assertEquals(existing.getId(), other.registrationId());
    assertEquals(RegistrationState.STARTED, other.state());
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

    final Registration saved = savedRegistration(result);
    assertEquals(PartialExamType.SPEAK, saved.getPartialExamType());
    assertEquals(RegistrationKind.ADMISSION, saved.getKind());
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

    assertEquals(RegistrationKind.QUEUE, savedRegistration(result).getKind());
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

    final var result = publicRegistrationService.initRegistration(
      identity2,
      initDTO(examSession.getId(), PartialExamType.ALL_PARTS, false)
    );

    assertNull(result.registrationId());
    assertNotNull(result.error());
    assertTrue(result.error().full());
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

    final Registration saved = savedRegistration(result);
    assertEquals(PartialExamType.READ, saved.getPartialExamType());
    assertEquals(RegistrationKind.ADMISSION, saved.getKind());
  }

  @Test
  public void testInitRegistrationPartialFullWhenAllPartsFullButSubPartAvailable() {
    final ExamSession examSession = persistReadSpeakSession(1, 2);
    persistAdmission(examSession, PartialExamType.ALL_PARTS);
    final Identity identity = persistIdentity();
    entityManager.flush();
    entityManager.clear();

    final PublicRegistrationInitResponseDTO result = publicRegistrationService.initRegistration(
      identity,
      initDTO(examSession.getId(), PartialExamType.ALL_PARTS)
    );

    assertNull(result.registrationId());
    assertTrue(result.error().full());
    assertTrue(result.error().partialFull());
  }

  @Test
  public void testInitRegistrationNotPartialFullWhenAllSubPartsFull() {
    final ExamSession examSession = persistReadSpeakSession(1, 1);
    persistAdmission(examSession, PartialExamType.ALL_PARTS);
    final Identity identity = persistIdentity();
    entityManager.flush();
    entityManager.clear();

    final PublicRegistrationInitResponseDTO result = publicRegistrationService.initRegistration(
      identity,
      initDTO(examSession.getId(), PartialExamType.ALL_PARTS)
    );

    assertNull(result.registrationId());
    assertTrue(result.error().full());
    assertFalse(result.error().partialFull());
  }

  @Test
  public void testInitRegistrationNotPartialFullForFullSession() {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setMaxParticipants(1);
    entityManager.persist(examDate);
    entityManager.persist(examSession);
    persistAdmission(examSession, PartialExamType.ALL_PARTS);
    final Identity identity = persistIdentity();
    entityManager.flush();
    entityManager.clear();

    final PublicRegistrationInitResponseDTO result = publicRegistrationService.initRegistration(
      identity,
      initDTO(examSession.getId(), PartialExamType.ALL_PARTS)
    );

    assertTrue(result.error().full());
    assertFalse(result.error().partialFull());
  }

  @Test
  public void testInitRegistrationAllPartsOnPartialSessionIsNotQueued() {
    final ExamSession examSession = persistReadSpeakSession(1, 2);
    persistAdmission(examSession, PartialExamType.ALL_PARTS);
    final Identity identity = persistIdentity();
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
    assertEquals(APIExceptionType.REGISTRATION_TO_QUEUE_NOT_ALLOWED, ex.getExceptionType());
    assertEquals(
      0,
      registrationRepository.findAll().stream().filter(r -> r.getKind() == RegistrationKind.QUEUE).count()
    );
  }

  @Test
  public void testInitRegistrationSubPartOnPartialSessionCanBeQueued() {
    final ExamSession examSession = persistReadSpeakSession(1, 2);
    persistAdmission(examSession, PartialExamType.READ);
    final Identity identity = persistIdentity();
    entityManager.flush();
    entityManager.clear();

    final PublicRegistrationInitResponseDTO result = publicRegistrationService.initRegistration(
      identity,
      initDTO(examSession.getId(), PartialExamType.READ, true)
    );

    final Registration saved = savedRegistration(result);
    assertEquals(RegistrationKind.QUEUE, saved.getKind());
    assertEquals(PartialExamType.READ, saved.getPartialExamType());
  }

  private Registration persistStartedRegistration(final Identity identity) {
    final ExamDate examDate = openExamDate();
    final ExamSession examSession = Factory.examSession(examDate);

    entityManager.persist(examDate);
    entityManager.persist(examSession);

    final Registration registration = new Registration();
    registration.setExamSession(examSession);
    registration.setIdentity(identity);
    registration.setState(RegistrationState.STARTED);
    registration.setKind(RegistrationKind.ADMISSION);
    registration.setPartialExamType(PartialExamType.ALL_PARTS);
    registration.setCreatedAt(LocalDateTime.now());
    entityManager.persist(registration);
    entityManager.flush();
    entityManager.clear();

    return registration;
  }

  private PublicRegistrationFormDTO formDTO() {
    return PublicRegistrationFormDTO
      .builder()
      .firstName("Testi")
      .lastName("Henkilö")
      .nationalities(List.of("246"))
      .certificateLang("fi")
      .examLang("fi")
      .birthdate("1990-01-01")
      .postOffice("Helsinki")
      .zip("00100")
      .streetAddress("Testikatu 1")
      .phoneNumber("+358401234567")
      .email("testi@example.com")
      .build();
  }

  @Test
  public void testSubmitRegistrationGetsPersonFromOnr() throws Exception {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity);
    final PublicRegistrationFormDTO form = formDTO();
    when(onrService.findOrCreatePerson(form, registration.getId())).thenReturn(Optional.of("1.2.246.562.24.1"));

    final PublicRegistrationSubmitResponseDTO result = publicRegistrationService.submitRegistration(
      identity,
      registration.getId(),
      "fi",
      form
    );

    assertTrue(result.success());
    verify(onrService).findOrCreatePerson(form, registration.getId());
  }

  @Test
  public void testSubmitRegistrationUsesPersonOfIdentityWithoutCallingOnr() {
    final Person person = Factory.person();
    entityManager.persist(person);
    final Identity identity = persistIdentity();
    identity.setPerson(person);
    final Registration registration = persistStartedRegistration(identity);

    final PublicRegistrationSubmitResponseDTO result = publicRegistrationService.submitRegistration(
      identity,
      registration.getId(),
      "fi",
      formDTO()
    );

    assertTrue(result.success());
    verifyNoInteractions(onrService);
  }

  @Test
  public void testSubmitRegistrationFailsWhenOnrReturnsNoPerson() throws Exception {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity);
    when(onrService.findOrCreatePerson(any(), anyLong())).thenReturn(Optional.empty());

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicRegistrationService.submitRegistration(identity, registration.getId(), "fi", formDTO())
    );
    assertEquals(APIExceptionType.PERSON_CREATION_FAILED, ex.getExceptionType());
  }

  @Test
  public void testSubmitRegistrationFailsWhenOnrCallFails() throws Exception {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity);
    when(onrService.findOrCreatePerson(any(), anyLong())).thenThrow(new ExecutionException("timeout", null));

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicRegistrationService.submitRegistration(identity, registration.getId(), "fi", formDTO())
    );
    assertEquals(APIExceptionType.PERSON_CREATION_FAILED, ex.getExceptionType());
  }

  @Test
  public void testSetRegistrationEmailAuthDetailsSavesEmailToForm() {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity);

    publicRegistrationService.setRegistrationEmailAuthDetails(registration, "testi@example.com");
    entityManager.flush();
    entityManager.clear();

    final Registration updated = registrationRepository.findById(registration.getId()).orElseThrow();
    assertEquals("testi@example.com", updated.getForm().path("email").asText());
    assertFalse(updated.getStrongAuth());
  }

  @Test
  public void testSetRegistrationEmailAuthDetailsKeepsOtherFormFields() {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity);
    registration.setForm(
      new ObjectMapper().createObjectNode().put("first_name", "Testi").put("email", "vanha@example.com")
    );
    entityManager.flush();

    publicRegistrationService.setRegistrationEmailAuthDetails(registration, "uusi@example.com");
    entityManager.flush();
    entityManager.clear();

    final Registration updated = registrationRepository.findById(registration.getId()).orElseThrow();
    assertEquals("uusi@example.com", updated.getForm().path("email").asText());
    assertEquals("Testi", updated.getForm().path("first_name").asText());
  }

  @Test
  public void testUpdateRegistrationPersonSetsSuomiFiAuthMethod() {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity);
    final Person person = entityManager.persist(Factory.person());

    publicRegistrationService.updateRegistrationPerson(registration.getId(), identity, person);

    final Identity updated = identityRepository.findById(identity.getId()).orElseThrow();
    assertEquals(IdentityAuthMethod.SUOMI_FI, updated.getAuthMethod());
    assertEquals(person.getOid(), updated.getPerson().getOid());
  }

  @Test
  public void testCreateLoginLinkCreatesLinkAndSendsEmail() {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity);

    publicRegistrationService.createLoginLink(
      identity,
      registration.getExamSession().getId(),
      registration.getId(),
      "testi@example.com",
      "sv"
    );

    final List<RegistrationLoginLink> loginLinks = registrationLoginLinkRepository.findAll();
    assertEquals(1, loginLinks.size());
    final RegistrationLoginLink loginLink = loginLinks.get(0);
    assertEquals(identity.getId(), loginLink.getIdentity().getId());
    assertEquals(registration.getId(), loginLink.getRegistration().getId());
    assertEquals("testi@example.com", loginLink.getEmail());

    final ArgumentCaptor<String> codeCaptor = ArgumentCaptor.forClass(String.class);
    verify(registrationEmailService)
      .sendLoginEmail(any(Registration.class), eq("testi@example.com"), codeCaptor.capture(), eq("sv"));
    assertEquals(StringUtil.sha256hex(codeCaptor.getValue()), loginLink.getCode());
  }

  @Test
  public void testCreateLoginLinkWithRecentLinkDoesNotSendAnother() {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity);
    final long examSessionId = registration.getExamSession().getId();

    publicRegistrationService.createLoginLink(identity, examSessionId, registration.getId(), "testi@example.com", "fi");
    publicRegistrationService.createLoginLink(identity, examSessionId, registration.getId(), "testi@example.com", "fi");
    publicRegistrationService.createLoginLink(identity, examSessionId, registration.getId(), "muu@example.com", "fi");

    assertEquals(2, registrationLoginLinkRepository.count());
    verify(registrationEmailService).sendLoginEmail(any(), eq("testi@example.com"), any(), eq("fi"));
    verify(registrationEmailService).sendLoginEmail(any(), eq("muu@example.com"), any(), eq("fi"));
    verifyNoMoreInteractions(registrationEmailService);
  }

  @Test
  public void testCreateLoginLinkForOtherIdentityThrows() {
    final Registration registration = persistStartedRegistration(persistIdentity());
    final Identity otherIdentity = persistIdentity();

    assertCreateLoginLinkThrows(
      otherIdentity,
      registration.getExamSession().getId(),
      registration.getId(),
      APIExceptionType.REGISTRATION_NOT_OWNED
    );
  }

  @Test
  public void testCreateLoginLinkForOtherExamSessionThrows() {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity);

    assertCreateLoginLinkThrows(
      identity,
      registration.getExamSession().getId() + 1,
      registration.getId(),
      APIExceptionType.NOT_FOUND
    );
  }

  @Test
  public void testCreateLoginLinkForSubmittedRegistrationThrows() {
    final Identity identity = persistIdentity();
    final Registration registration = persistStartedRegistration(identity);
    final Registration saved = registrationRepository.findById(registration.getId()).orElseThrow();
    saved.setState(RegistrationState.SUBMITTED);
    registrationRepository.saveAndFlush(saved);

    assertCreateLoginLinkThrows(
      identity,
      registration.getExamSession().getId(),
      registration.getId(),
      APIExceptionType.REGISTRATION_NOT_STARTED
    );
  }

  @Test
  public void testCreateLoginLinkWhenRegistrationClosedThrows() {
    final Identity identity = persistIdentity();
    final ExamDate examDate = closedExamDate();
    final ExamSession examSession = Factory.examSession(examDate);
    entityManager.persist(examDate);
    entityManager.persist(examSession);
    final Registration registration = Factory.registration(null);
    registration.setExamSession(examSession);
    registration.setIdentity(identity);
    registration.setState(RegistrationState.STARTED);
    entityManager.persistAndFlush(registration);

    assertCreateLoginLinkThrows(
      identity,
      examSession.getId(),
      registration.getId(),
      APIExceptionType.REGISTRATION_CLOSED
    );
  }

  private void assertCreateLoginLinkThrows(
    final Identity identity,
    final long examSessionId,
    final long registrationId,
    final APIExceptionType exceptionType
  ) {
    final APIException ex = assertThrows(
      APIException.class,
      () ->
        publicRegistrationService.createLoginLink(identity, examSessionId, registrationId, "testi@example.com", "fi")
    );
    assertEquals(exceptionType, ex.getExceptionType());
    assertEquals(0, registrationLoginLinkRepository.count());
    verifyNoInteractions(registrationEmailService);
  }
}
