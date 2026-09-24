package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

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
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
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
