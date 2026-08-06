package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionLocationCreateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionUpdateDTO;
import fi.oph.yki.api.dto.clerk.ClerkRegistrationDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.repository.ExamDateRepository;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.OrganizerRepository;
import fi.oph.yki.repository.RegistrationRepository;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

  @MockitoBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  private final ObjectMapper objectMapper = new ObjectMapper();

  private ClerkExamSessionService clerkExamSessionService;

  @BeforeEach
  public void setup() {
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
}
