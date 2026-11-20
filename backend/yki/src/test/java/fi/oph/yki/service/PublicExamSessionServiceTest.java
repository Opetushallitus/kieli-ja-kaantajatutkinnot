package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.PublicExamSessionDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamSessionRepository;
import jakarta.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
public class PublicExamSessionServiceTest {

  @Resource
  private ExamSessionRepository examSessionRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicExamSessionService publicExamSessionService;

  private ExamDate examDate;

  private Organizer organizer;

  private Person person;

  @BeforeEach
  public void setup() {
    final MockEnvironment fees = new MockEnvironment()
      .withProperty("app.exam-fee.perus", "165")
      .withProperty("app.exam-fee.keski", "190")
      .withProperty("app.exam-fee.ylin", "216")
      .withProperty("app.exam-fee.keski-read", "43")
      .withProperty("app.exam-fee.keski-listen", "44")
      .withProperty("app.exam-fee.keski-write", "70")
      .withProperty("app.exam-fee.keski-speak", "84");
    publicExamSessionService = new PublicExamSessionService(examSessionRepository, new ExamFeeService(fees));

    examDate = Factory.examDate();
    examDate.setExamDate(LocalDate.now().plusMonths(1));
    examDate.setRegistrationStartDate(LocalDate.now().minusDays(10));
    examDate.setRegistrationEndDate(LocalDate.now().plusDays(10));
    entityManager.persist(examDate);

    organizer = Factory.organizer();
    entityManager.persist(organizer);

    person = Factory.person();
    entityManager.persist(person);
  }

  // The test database trigger checks only max_participants on insert, so registrations are inserted
  // as admissions while there is room, and the kinds and limits under test are set afterwards.
  private ExamSession persistExamSession(final ExamDate examDate, final ExamSessionType type) {
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setOrganizer(organizer);
    examSession.setType(type);
    examSession.setMaxParticipants(100);
    entityManager.persist(examSession);

    return examSession;
  }

  private Registration persistRegistration(final ExamSession examSession, final PartialExamType partialExamType) {
    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setPartialExamType(partialExamType);
    entityManager.persist(registration);
    entityManager.flush();

    return registration;
  }

  private PublicExamSessionDTO findExamSession(final ExamSession examSession) {
    entityManager.flush();
    entityManager.clear();

    return publicExamSessionService
      .getUpcomingExamSessions()
      .stream()
      .filter(dto -> dto.id() == examSession.getId())
      .findFirst()
      .orElseThrow();
  }

  @Test
  public void testGetUpcomingExamSessionsFullSessionWithRoom() {
    final ExamSession examSession = persistExamSession(examDate, ExamSessionType.FULL);
    entityManager.persist(Factory.examSessionLocation(examSession));
    persistRegistration(examSession, PartialExamType.ALL_PARTS);
    persistRegistration(examSession, PartialExamType.ALL_PARTS).setState(RegistrationState.CANCELLED);
    examSession.setMaxParticipants(2);
    final LocalDateTime publishedAt = LocalDateTime.of(2025, 11, 10, 9, 55, 20, 899_000_000);
    examSession.setPublishedAt(publishedAt);

    final PublicExamSessionDTO dto = findExamSession(examSession);

    assertEquals(ExamSessionType.FULL, dto.type());
    assertEquals(1, dto.participants());
    assertEquals(0, dto.queue());
    assertEquals(0, dto.participantsReadListen());
    assertEquals(0, dto.participantsSpeakWrite());
    assertEquals(organizer.getOid(), dto.organizerOid());
    assertEquals(examDate.getExamDate(), dto.sessionDate());
    assertTrue(dto.open());
    assertTrue(dto.upcomingAdmission());
    assertEquals(RegistrationKind.ADMISSION, dto.availableRegistrationKind());
    assertEquals(Map.of(PartialExamType.ALL_PARTS, RegistrationKind.ADMISSION), dto.partialRegistrationKind());
    assertEquals(1, dto.location().size());
    assertEquals("Testipaikka", dto.location().getFirst().name());
    assertEquals("Testikatu 1", dto.location().getFirst().streetAddress());
    assertEquals("fi", dto.location().getFirst().lang());
    assertEquals(publishedAt.atZone(ZoneId.systemDefault()).toInstant().toString(), dto.publishedAt());
    assertEquals(new BigDecimal("165"), dto.examFee());
    assertNull(dto.examFeeReadListen());
    assertNull(dto.examFeeSpeakWrite());
  }

  @Test
  public void testGetUpcomingExamSessionsFullSessionWithoutLocationsOrRegistrations() {
    final ExamSession examSession = persistExamSession(examDate, ExamSessionType.FULL);

    final PublicExamSessionDTO dto = findExamSession(examSession);

    assertEquals(0, dto.participants());
    assertEquals(0, dto.queue());
    assertEquals(RegistrationKind.ADMISSION, dto.availableRegistrationKind());
    assertEquals(List.of(), dto.location());
  }

  @Test
  public void testGetUpcomingExamSessionsFullSessionAtMaxParticipants() {
    final ExamSession examSession = persistExamSession(examDate, ExamSessionType.FULL);
    persistRegistration(examSession, PartialExamType.ALL_PARTS).setState(RegistrationState.COMPLETED);
    examSession.setMaxParticipants(1);

    final PublicExamSessionDTO dto = findExamSession(examSession);

    assertEquals(1, dto.participants());
    assertEquals(RegistrationKind.QUEUE, dto.availableRegistrationKind());
    assertEquals(Map.of(PartialExamType.ALL_PARTS, RegistrationKind.QUEUE), dto.partialRegistrationKind());
  }

  @Test
  public void testGetUpcomingExamSessionsFullSessionWithQueue() {
    final ExamSession examSession = persistExamSession(examDate, ExamSessionType.FULL);
    persistRegistration(examSession, PartialExamType.ALL_PARTS).setKind(RegistrationKind.QUEUE);

    final PublicExamSessionDTO dto = findExamSession(examSession);

    assertEquals(0, dto.participants());
    assertEquals(1, dto.queue());
    assertEquals(RegistrationKind.QUEUE, dto.availableRegistrationKind());
  }

  @Test
  public void testGetUpcomingExamSessionsReadSpeakSessionWithReadPoolFull() {
    final ExamSession examSession = persistExamSession(examDate, ExamSessionType.READ_SPEAK);
    persistRegistration(examSession, PartialExamType.READ);
    examSession.setMaxParticipantsReadListen(1);
    examSession.setMaxParticipantsSpeakWrite(5);

    final PublicExamSessionDTO dto = findExamSession(examSession);

    assertEquals(1, dto.participants());
    assertEquals(1, dto.participantsReadListen());
    assertEquals(0, dto.participantsSpeakWrite());
    assertEquals(RegistrationKind.QUEUE, dto.availableRegistrationKind());
    assertEquals(
      Map.of(
        PartialExamType.ALL_PARTS,
        RegistrationKind.QUEUE,
        PartialExamType.READ,
        RegistrationKind.QUEUE,
        PartialExamType.SPEAK,
        RegistrationKind.ADMISSION
      ),
      dto.partialRegistrationKind()
    );
    assertEquals(new BigDecimal("127"), dto.examFee());
    assertEquals(new BigDecimal("43"), dto.examFeeReadListen());
    assertEquals(new BigDecimal("84"), dto.examFeeSpeakWrite());
  }

  @Test
  public void testGetUpcomingExamSessionsListenWriteSessionWithWriteQueue() {
    final ExamSession examSession = persistExamSession(examDate, ExamSessionType.LISTEN_WRITE);
    persistRegistration(examSession, PartialExamType.ALL_PARTS);
    persistRegistration(examSession, PartialExamType.WRITE).setKind(RegistrationKind.QUEUE);
    examSession.setMaxParticipantsReadListen(5);
    examSession.setMaxParticipantsSpeakWrite(5);

    final PublicExamSessionDTO dto = findExamSession(examSession);

    assertEquals(1, dto.participants());
    assertEquals(1, dto.queue());
    assertEquals(1, dto.participantsReadListen());
    assertEquals(1, dto.participantsSpeakWrite());
    assertEquals(RegistrationKind.QUEUE, dto.availableRegistrationKind());
    assertEquals(
      Map.of(
        PartialExamType.ALL_PARTS,
        RegistrationKind.QUEUE,
        PartialExamType.LISTEN,
        RegistrationKind.ADMISSION,
        PartialExamType.WRITE,
        RegistrationKind.QUEUE
      ),
      dto.partialRegistrationKind()
    );
    assertEquals(new BigDecimal("114"), dto.examFee());
    assertEquals(new BigDecimal("44"), dto.examFeeReadListen());
    assertEquals(new BigDecimal("70"), dto.examFeeSpeakWrite());
  }

  @Test
  public void testGetUpcomingExamSessionsListsSessionOnceWithRegistrationsOfSeveralPartialExamTypes() {
    final ExamSession examSession = persistExamSession(examDate, ExamSessionType.LISTEN_WRITE);
    persistRegistration(examSession, PartialExamType.ALL_PARTS);
    persistRegistration(examSession, PartialExamType.LISTEN);
    persistRegistration(examSession, PartialExamType.WRITE).setKind(RegistrationKind.QUEUE);
    entityManager.flush();
    entityManager.clear();

    final List<PublicExamSessionDTO> dtos = publicExamSessionService
      .getUpcomingExamSessions()
      .stream()
      .filter(dto -> dto.id() == examSession.getId())
      .toList();

    assertEquals(1, dtos.size());
    assertEquals(2, dtos.getFirst().participants());
    assertEquals(1, dtos.getFirst().queue());
  }

  @Test
  public void testGetUpcomingExamSessionsExcludesPastExamDates() {
    final ExamDate pastExamDate = Factory.examDate();
    pastExamDate.setExamDate(LocalDate.now().minusDays(1));
    entityManager.persist(pastExamDate);
    final ExamSession pastExamSession = persistExamSession(pastExamDate, ExamSessionType.FULL);
    final ExamSession upcomingExamSession = persistExamSession(examDate, ExamSessionType.FULL);
    entityManager.flush();
    entityManager.clear();

    final List<Long> ids = publicExamSessionService
      .getUpcomingExamSessions()
      .stream()
      .map(PublicExamSessionDTO::id)
      .toList();

    assertTrue(ids.contains(upcomingExamSession.getId()));
    assertFalse(ids.contains(pastExamSession.getId()));
  }
}
