package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionLocationCreateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionSummaryDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionUpdateDTO;
import fi.oph.yki.api.dto.clerk.ClerkRegistrationDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.LoggerImpl;
import fi.oph.yki.config.Constants;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.ExamDateRepository;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.OrganizerRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.vm.sade.auditlog.ApplicationType;
import fi.vm.sade.auditlog.Audit;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.hibernate.Hibernate;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
public class ClerkExamSessionServiceTest {

  @Resource
  private ExamSessionRepository examSessionRepository;

  @Resource
  private RegistrationRepository registrationRepository;

  @Resource
  private ExamDateRepository examDateRepository;

  @Resource
  private OrganizerRepository organizerRepository;

  @MockitoBean
  private OnrService onrService;

  @Resource
  private TestEntityManager entityManager;

  private final ObjectMapper objectMapper = new ObjectMapper();

  private ClerkExamSessionService clerkExamSessionService;

  @BeforeEach
  public void setup() {
    final AuditService auditService = new AuditService(
      new Audit(new LoggerImpl(), Constants.SERVICENAME, ApplicationType.VIRKAILIJA)
    );
    clerkExamSessionService =
      new ClerkExamSessionService(
        examSessionRepository,
        registrationRepository,
        examDateRepository,
        organizerRepository,
        auditService,
        onrService
      );
  }

  @Test
  public void testGetExamSessionSummariesUsesOneQueryWithoutRegistrations() {
    final ExamDate examDate = Factory.examDate();
    entityManager.persist(examDate);
    final ExamSession session = Factory.examSession(examDate);
    final ExamSession withoutLocation = Factory.examSession(examDate);
    final ExamSession otherLanguage = Factory.examSession(examDate);
    otherLanguage.setLanguage("swe");
    final ExamSession otherLevel = Factory.examSession(examDate);
    otherLevel.setLevel("KESKI");
    for (final ExamSession examSession : List.of(session, withoutLocation, otherLanguage, otherLevel)) {
      entityManager.persist(examSession);
    }
    final ExamSessionLocation finnish = Factory.examSessionLocation(session);
    final ExamSessionLocation swedish = Factory.examSessionLocation(session);
    swedish.setLang("sv");
    swedish.setName("Provplats");
    entityManager.persist(finnish);
    entityManager.persist(swedish);
    final Person person = Factory.person();
    entityManager.persist(person);
    final Registration registration = Factory.registration(person);
    registration.setExamSession(session);
    registration.setState(RegistrationState.COMPLETED);
    registration.setForm(objectMapper.createObjectNode());
    entityManager.persist(registration);
    entityManager.flush();
    entityManager.clear();

    final var statistics = entityManager
      .getEntityManager()
      .getEntityManagerFactory()
      .unwrap(SessionFactory.class)
      .getStatistics();
    statistics.setStatisticsEnabled(true);
    statistics.clear();
    try {
      final List<ClerkExamSessionSummaryDTO> results = clerkExamSessionService.getExamSessionSummariesByLanguageAndLevel(
        "fin",
        "PERUS"
      );
      assertEquals(1, statistics.getPrepareStatementCount());
      assertEquals(
        Set.of(session.getId(), withoutLocation.getId()),
        results.stream().map(ClerkExamSessionSummaryDTO::id).collect(Collectors.toSet())
      );
      final ClerkExamSessionSummaryDTO result = results
        .stream()
        .filter(dto -> dto.id() == session.getId())
        .findFirst()
        .orElseThrow();
      assertEquals(examDate.getExamDate(), result.date());
      assertEquals("fin", result.language());
      assertEquals("PERUS", result.level());
      assertEquals(
        Set.of("fi", "sv"),
        result.location().stream().map(location -> location.lang()).collect(Collectors.toSet())
      );
      assertTrue(result.location().stream().allMatch(location -> "Testikatu 1".equals(location.streetAddress())));
      assertTrue(
        results
          .stream()
          .filter(dto -> dto.id() == withoutLocation.getId())
          .findFirst()
          .orElseThrow()
          .location()
          .isEmpty()
      );
      assertFalse(Hibernate.isInitialized(entityManager.find(ExamSession.class, session.getId()).getRegistrations()));
      verifyNoInteractions(onrService);
    } finally {
      statistics.setStatisticsEnabled(false);
    }
  }

  private ExamDate persistTransferExamDate(final LocalDate date) {
    final ExamDate examDate = Factory.examDate();
    examDate.setExamDate(date);
    return entityManager.persist(examDate);
  }

  private ExamSession persistTransferSession(
    final Organizer organizer,
    final ExamDate date,
    final String language,
    final String level
  ) {
    final ExamSession session = Factory.examSession(date);
    session.setOrganizer(organizer);
    session.setLanguage(language);
    session.setLevel(level);
    return entityManager.persist(session);
  }

  @Test
  public void testOrganizerTransferTargetsMatchLegacyRestrictionsWithoutLoadingRegistrations() {
    final Organizer organizer = entityManager.persist(Factory.organizer());
    final Organizer otherOrganizer = Factory.organizer();
    otherOrganizer.setOid("1.2.246.562.10.00000000002");
    entityManager.persist(otherOrganizer);
    final LocalDate sourceDate = LocalDate.of(2026, 1, 31);
    final ExamDate date = persistTransferExamDate(sourceDate);
    final ExamSession source = persistTransferSession(organizer, date, "fin", "PERUS");
    final ExamSession sameDay = persistTransferSession(organizer, date, "fin", "PERUS");
    final ExamSession lastDay = persistTransferSession(
      organizer,
      persistTransferExamDate(sourceDate.plusYears(1)),
      "fin",
      "PERUS"
    );
    persistTransferSession(organizer, persistTransferExamDate(sourceDate.minusDays(1)), "fin", "PERUS");
    persistTransferSession(organizer, persistTransferExamDate(sourceDate.plusYears(1).plusDays(1)), "fin", "PERUS");
    persistTransferSession(otherOrganizer, date, "fin", "PERUS");
    persistTransferSession(organizer, date, "swe", "PERUS");
    persistTransferSession(organizer, date, "fin", "KESKI");
    entityManager.persist(Factory.examSessionLocation(sameDay));
    final ExamSessionLocation swedish = Factory.examSessionLocation(sameDay);
    swedish.setLang("sv");
    entityManager.persist(swedish);
    entityManager.flush();
    entityManager.clear();

    final var statistics = entityManager
      .getEntityManager()
      .getEntityManagerFactory()
      .unwrap(SessionFactory.class)
      .getStatistics();
    statistics.setStatisticsEnabled(true);
    statistics.clear();
    try {
      final List<ClerkExamSessionSummaryDTO> targets = clerkExamSessionService.getOrganizerTransferTargets(
        organizer.getOid(),
        source.getId()
      );
      assertEquals(2, statistics.getPrepareStatementCount());
      assertEquals(
        List.of(sameDay.getId(), lastDay.getId()),
        targets.stream().map(ClerkExamSessionSummaryDTO::id).toList()
      );
      assertEquals(2, targets.get(0).location().size());
      assertEquals("Testikatu 1", targets.get(0).location().get(0).streetAddress());
      assertEquals(sourceDate, targets.get(0).date());
      assertEquals("fin", targets.get(0).language());
      assertEquals("PERUS", targets.get(0).level());
      assertTrue(targets.get(1).location().isEmpty());
      assertFalse(Hibernate.isInitialized(entityManager.find(ExamSession.class, sameDay.getId()).getRegistrations()));
      verifyNoInteractions(onrService);
    } finally {
      statistics.setStatisticsEnabled(false);
    }
  }

  @Test
  public void testOrganizerTransferTargetsFallBackToOnlyEarliestCandidateAfterOneYear() {
    final Organizer organizer = entityManager.persist(Factory.organizer());
    final LocalDate sourceDate = LocalDate.of(2026, 1, 31);
    final ExamSession source = persistTransferSession(organizer, persistTransferExamDate(sourceDate), "fin", "PERUS");
    persistTransferSession(organizer, persistTransferExamDate(sourceDate.plusYears(2)), "fin", "PERUS");
    final ExamDate firstDate = persistTransferExamDate(sourceDate.plusYears(1).plusDays(1));
    final ExamSession first = persistTransferSession(organizer, firstDate, "fin", "PERUS");
    persistTransferSession(organizer, firstDate, "fin", "PERUS");
    entityManager.flush();
    entityManager.clear();

    final var targets = clerkExamSessionService.getOrganizerTransferTargets(organizer.getOid(), source.getId());
    assertEquals(List.of(first.getId()), targets.stream().map(ClerkExamSessionSummaryDTO::id).toList());
  }

  @Test
  public void testOrganizerTransferTargetsReturnEmptyWhenNoEligibleSessionsExist() {
    final Organizer organizer = entityManager.persist(Factory.organizer());
    final ExamDate date = persistTransferExamDate(LocalDate.of(2026, 1, 31));
    final ExamSession source = persistTransferSession(organizer, date, "fin", "PERUS");
    persistTransferSession(organizer, date, "swe", "PERUS");
    entityManager.flush();
    entityManager.clear();

    assertTrue(clerkExamSessionService.getOrganizerTransferTargets(organizer.getOid(), source.getId()).isEmpty());
  }

  @Test
  public void testOrganizerTransferTargetsRejectSourceOutsideOrganizer() {
    final Organizer organizer = entityManager.persist(Factory.organizer());
    final Organizer otherOrganizer = Factory.organizer();
    otherOrganizer.setOid("1.2.246.562.10.00000000002");
    entityManager.persist(otherOrganizer);
    final ExamSession source = persistTransferSession(
      organizer,
      persistTransferExamDate(LocalDate.of(2026, 1, 31)),
      "fin",
      "PERUS"
    );
    entityManager.flush();
    entityManager.clear();

    assertThrows(
      AccessDeniedException.class,
      () -> clerkExamSessionService.getOrganizerTransferTargets(otherOrganizer.getOid(), source.getId())
    );
    assertThrows(
      AccessDeniedException.class,
      () -> clerkExamSessionService.getOrganizerTransferTargets(organizer.getOid(), Long.MAX_VALUE)
    );
    verifyNoInteractions(onrService);
  }

  @Test
  public void testGetExamSession() {
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final ExamSessionLocation location = Factory.examSessionLocation(examSession);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(location);
    entityManager.flush();
    entityManager.clear();

    final ClerkExamSessionDTO result = clerkExamSessionService.getExamSession(examSession.getId());

    assertEquals(examSession.getId(), result.id());
    assertEquals("fin", result.language());
    assertEquals("PERUS", result.level());
    assertEquals(20, result.maxParticipantsTotal());
    assertEquals("Testi Henkilö", result.contactName());
    assertEquals("testi@example.com", result.contactEmail());
    assertEquals("0401234567", result.contactPhoneNumber());
    assertEquals(LocalDate.of(2026, 6, 15), result.date());
    assertEquals(LocalDate.of(2026, 3, 1), result.registrationStartDate());
    assertEquals(LocalDate.of(2026, 5, 31), result.registrationEndDate());
    assertEquals(1, result.location().size());
    assertEquals("Testikatu 1", result.location().get(0).streetAddress());
    assertTrue(result.registrations().isEmpty());
  }

  @Test
  public void testGetExamSessionIncludesExpiredRegistrations() {
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final ExamSessionLocation location = Factory.examSessionLocation(examSession);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(location);

    final Person expiredPerson = Factory.person();
    final Registration expiredRegistration = Factory.registration(expiredPerson);
    expiredRegistration.setExamSession(examSession);
    expiredRegistration.setState(RegistrationState.EXPIRED);
    expiredRegistration.setCreatedAt(LocalDateTime.of(2026, 4, 1, 10, 0));
    expiredRegistration.setForm(objectMapper.createObjectNode().put("ssn", "010675-9981"));

    final Person completedPerson = Factory.person();
    completedPerson.setOid("1.2.3.4.6");
    final Registration completedRegistration = Factory.registration(completedPerson);
    completedRegistration.setExamSession(examSession);
    completedRegistration.setState(RegistrationState.COMPLETED);
    completedRegistration.setCreatedAt(LocalDateTime.of(2026, 4, 2, 10, 0));
    completedRegistration.setForm(objectMapper.createObjectNode().put("ssn", "020675-9982"));

    final Person neverSubmittedPerson = Factory.person();
    neverSubmittedPerson.setOid("1.2.3.4.7");
    final Registration neverSubmittedRegistration = Factory.registration(neverSubmittedPerson);
    neverSubmittedRegistration.setExamSession(examSession);
    neverSubmittedRegistration.setState(RegistrationState.EXPIRED);
    neverSubmittedRegistration.setCreatedAt(LocalDateTime.of(2026, 4, 3, 10, 0));

    entityManager.persist(expiredPerson);
    entityManager.persist(expiredRegistration);
    entityManager.persist(completedPerson);
    entityManager.persist(completedRegistration);
    entityManager.persist(neverSubmittedPerson);
    entityManager.persist(neverSubmittedRegistration);
    entityManager.flush();
    entityManager.clear();

    final ClerkExamSessionDTO result = clerkExamSessionService.getExamSession(examSession.getId());

    assertEquals(2, result.registrations().size());

    final Set<RegistrationState> states = result
      .registrations()
      .stream()
      .map(ClerkRegistrationDTO::state)
      .collect(Collectors.toSet());

    assertTrue(states.contains(RegistrationState.EXPIRED));
    assertTrue(states.contains(RegistrationState.COMPLETED));

    final boolean containsNeverSubmittedPerson = result
      .registrations()
      .stream()
      .anyMatch(r -> r.person().oid().equals(neverSubmittedPerson.getOid()));

    assertFalse(containsNeverSubmittedPerson);
  }

  @Test
  public void testGetExamSessionResolvesSsnFromOnr() throws Exception {
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final ExamSessionLocation location = Factory.examSessionLocation(examSession);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(location);

    final Person person = Factory.person();
    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setState(RegistrationState.COMPLETED);
    registration.setCreatedAt(LocalDateTime.of(2026, 4, 2, 10, 0));
    registration.setForm(objectMapper.createObjectNode().put("ssn", "020675-9982"));

    entityManager.persist(person);
    entityManager.persist(registration);
    entityManager.flush();
    entityManager.clear();

    final PersonalDataDTO personalDataDTO = new PersonalDataDTO();
    personalDataDTO.setOidHenkilo(person.getOid());
    personalDataDTO.setIdentityNumber("SSN-FROM-ONR");
    when(onrService.listPersonDetails(any())).thenReturn(List.of(personalDataDTO));

    final ClerkExamSessionDTO result = clerkExamSessionService.getExamSession(examSession.getId());

    assertEquals(1, result.registrations().size());
    assertEquals("SSN-FROM-ONR", result.registrations().get(0).person().socialSecurityNumber());
  }

  @Test
  public void testUpdateExamSession() {
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final ExamSessionLocation location = Factory.examSessionLocation(examSession);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(location);
    entityManager.flush();
    entityManager.clear();

    final ClerkExamSessionLocationCreateDTO locationDTO = ClerkExamSessionLocationCreateDTO
      .builder()
      .lang("fi")
      .name("Testipaikka")
      .streetAddress("Uusi katu 2")
      .postalCode("00200")
      .city("Espoo")
      .build();

    final ClerkExamSessionUpdateDTO updateDTO = ClerkExamSessionUpdateDTO
      .builder()
      .language("deu")
      .level("KESKI")
      .maxParticipantsTotal(30)
      .location(List.of(locationDTO))
      .contactName("Uusi Henkilö")
      .contactEmail("uusi@example.com")
      .contactPhoneNumber("0509876543")
      .build();

    final ClerkExamSessionDTO result = clerkExamSessionService.updateExamSession(examSession.getId(), updateDTO);

    assertEquals("deu", result.language());
    assertEquals("KESKI", result.level());
    assertEquals(30, result.maxParticipantsTotal());
    assertEquals("Uusi Henkilö", result.contactName());
    assertEquals("uusi@example.com", result.contactEmail());
    assertEquals("0509876543", result.contactPhoneNumber());
    assertEquals(1, result.location().size());
    assertEquals("Uusi katu 2", result.location().get(0).streetAddress());
    assertEquals("00200", result.location().get(0).zip());
    assertEquals("Espoo", result.location().get(0).postOffice());
  }

  @Test
  public void testGetExamSessionQueuePositionsForFullExamSession() {
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final ExamSessionLocation location = Factory.examSessionLocation(examSession);

    examSession.setMaxParticipants(1);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(location);

    final Person person1 = Factory.person();
    final Person person2 = Factory.person();
    person2.setOid("1.2.3.4.6");
    final Person admissionPerson = Factory.person();
    admissionPerson.setOid("1.2.3.4.7");

    entityManager.persist(person1);
    entityManager.persist(person2);
    entityManager.persist(admissionPerson);

    final Registration queue1 = Factory.registration(person1);
    queue1.setExamSession(examSession);
    queue1.setState(RegistrationState.SUBMITTED);
    queue1.setKind(RegistrationKind.QUEUE);
    queue1.setPartialExamType(PartialExamType.ALL_PARTS);
    queue1.setCreatedAt(LocalDateTime.of(2026, 4, 1, 10, 0));
    queue1.setForm(objectMapper.createObjectNode());

    final Registration queue2 = Factory.registration(person2);
    queue2.setExamSession(examSession);
    queue2.setState(RegistrationState.SUBMITTED);
    queue2.setKind(RegistrationKind.QUEUE);
    queue2.setPartialExamType(PartialExamType.ALL_PARTS);
    queue2.setCreatedAt(LocalDateTime.of(2026, 4, 2, 10, 0));
    queue2.setForm(objectMapper.createObjectNode());

    final Registration admission = Factory.registration(admissionPerson);
    admission.setExamSession(examSession);
    admission.setState(RegistrationState.COMPLETED);
    admission.setKind(RegistrationKind.ADMISSION);
    admission.setPartialExamType(PartialExamType.ALL_PARTS);
    admission.setCreatedAt(LocalDateTime.of(2026, 3, 15, 10, 0));
    admission.setForm(objectMapper.createObjectNode());

    entityManager.persist(admission);
    entityManager.persist(queue1);
    entityManager.persist(queue2);
    entityManager.flush();
    entityManager.clear();

    final ClerkExamSessionDTO result = clerkExamSessionService.getExamSession(examSession.getId());

    final Map<Long, ClerkRegistrationDTO> byId = result
      .registrations()
      .stream()
      .collect(Collectors.toMap(ClerkRegistrationDTO::id, Function.identity()));

    assertEquals(1L, byId.get(queue1.getId()).queuePosition());
    assertEquals(2L, byId.get(queue2.getId()).queuePosition());
    assertEquals(null, byId.get(admission.getId()).queuePosition());
  }

  @Test
  public void testGetExamSessionQueuePositionsForPartialExamSession() {
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setType(ExamSessionType.READ_SPEAK);
    examSession.setMaxParticipants(1);
    final ExamSessionLocation location = Factory.examSessionLocation(examSession);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(location);

    final Person person0 = Factory.person();
    final Person person1 = Factory.person();
    person0.setOid("1.2.3.4.6");
    final Person person2 = Factory.person();
    person2.setOid("1.2.3.4.7");
    final Person person3 = Factory.person();
    person3.setOid("1.2.3.4.8");

    entityManager.persist(person0);
    entityManager.persist(person1);
    entityManager.persist(person2);
    entityManager.persist(person3);

    final Registration admission = Factory.registration(person0);
    admission.setExamSession(examSession);
    admission.setState(RegistrationState.SUBMITTED);
    admission.setKind(RegistrationKind.ADMISSION);
    admission.setPartialExamType(PartialExamType.ALL_PARTS);
    admission.setCreatedAt(LocalDateTime.of(2026, 4, 1, 9, 0));
    admission.setForm(objectMapper.createObjectNode());

    final Registration queueRead = Factory.registration(person1);
    queueRead.setExamSession(examSession);
    queueRead.setState(RegistrationState.SUBMITTED);
    queueRead.setKind(RegistrationKind.QUEUE);
    queueRead.setPartialExamType(PartialExamType.READ);
    queueRead.setCreatedAt(LocalDateTime.of(2026, 4, 1, 10, 0));
    queueRead.setForm(objectMapper.createObjectNode());

    final Registration queueSpeak1 = Factory.registration(person2);
    queueSpeak1.setExamSession(examSession);
    queueSpeak1.setState(RegistrationState.SUBMITTED);
    queueSpeak1.setKind(RegistrationKind.QUEUE);
    queueSpeak1.setPartialExamType(PartialExamType.SPEAK);
    queueSpeak1.setCreatedAt(LocalDateTime.of(2026, 4, 1, 11, 0));
    queueSpeak1.setForm(objectMapper.createObjectNode());

    final Registration queueSpeak2 = Factory.registration(person3);
    queueSpeak2.setExamSession(examSession);
    queueSpeak2.setState(RegistrationState.SUBMITTED);
    queueSpeak2.setKind(RegistrationKind.QUEUE);
    queueSpeak2.setPartialExamType(PartialExamType.SPEAK);
    queueSpeak2.setCreatedAt(LocalDateTime.of(2026, 4, 2, 10, 0));
    queueSpeak2.setForm(objectMapper.createObjectNode());

    entityManager.persist(admission);
    entityManager.persist(queueRead);
    entityManager.persist(queueSpeak1);
    entityManager.persist(queueSpeak2);
    entityManager.flush();
    entityManager.clear();

    final ClerkExamSessionDTO result = clerkExamSessionService.getExamSession(examSession.getId());

    final Map<Long, ClerkRegistrationDTO> byId = result
      .registrations()
      .stream()
      .collect(Collectors.toMap(ClerkRegistrationDTO::id, Function.identity()));

    assertEquals(1L, byId.get(queueRead.getId()).queuePosition());
    assertEquals(1L, byId.get(queueSpeak1.getId()).queuePosition());
    assertEquals(2L, byId.get(queueSpeak2.getId()).queuePosition());
    assertNull(byId.get(admission.getId()).queuePosition());
  }
}
