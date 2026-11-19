package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.clerk.ClerkCustomerSearchRequestDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.LoggerImpl;
import fi.oph.yki.config.Constants;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.OrganizerRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.vm.sade.auditlog.ApplicationType;
import fi.vm.sade.auditlog.Audit;
import jakarta.annotation.Resource;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
class ClerkCustomerServiceTest {

  // The OID of Factory.person().
  private static final String PERSON_OID = "1.2.3.4.5";
  private static final String INDIVIDUALISED_PERSON_OID = "1.2.3.4.6";
  private static final String HENKILO_UI_URL = "https://virkailija.example.fi/henkilo-ui";

  @Resource
  private PersonRepository personRepository;

  @Resource
  private OrganizerRepository organizerRepository;

  @Resource
  private RegistrationRepository registrationRepository;

  @MockitoBean
  private OnrService onrService;

  @Resource
  private TestEntityManager entityManager;

  private ClerkCustomerService clerkCustomerService;

  private Organizer organizer;

  private ExamSession examSession;

  private Participant participant;

  @BeforeEach
  public void setup() throws Exception {
    final AuditService auditService = new AuditService(
      new Audit(new LoggerImpl(), Constants.SERVICENAME, ApplicationType.VIRKAILIJA)
    );
    clerkCustomerService =
      new ClerkCustomerService(personRepository, organizerRepository, registrationRepository, onrService, auditService);
    ReflectionTestUtils.setField(clerkCustomerService, "henkiloUiUrl", HENKILO_UI_URL);
    when(onrService.getPersonalData(PERSON_OID)).thenReturn(new PersonalDataDTO());

    // A person whom ONR has not individualised, with one registration to the organiser's session.
    organizer = Factory.organizer();
    final ExamDate examDate = Factory.examDate();
    examSession = Factory.examSession(examDate);
    examSession.setOrganizer(organizer);
    final Person person = Factory.person();
    person.setIndividualised(false);
    person.setOnrLastSyncAt(LocalDateTime.now());
    participant = Factory.participant("test@example.com");
    final Registration registration = Factory.registration(person);
    registration.setParticipant(participant);
    registration.setExamSession(examSession);

    entityManager.persist(organizer);
    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(person);
    entityManager.persist(participant);
    entityManager.persist(registration);
    entityManager.flush();
    entityManager.clear();
  }

  @Test
  public void testClerkGetsIndividualisedStatus() throws Exception {
    final var customers = clerkCustomerService.searchClerkCustomers(
      PageRequest.of(0, 10),
      ClerkCustomerSearchRequestDTO.builder().build()
    );

    assertEquals(false, customers.getContent().get(0).person().individualised());
    assertEquals(false, clerkCustomerService.getClerkCustomerDetails(PERSON_OID).person().individualised());
  }

  @Test
  public void testOrganiserGetsIndividualisedStatus() throws Exception {
    final var customers = clerkCustomerService.searchOrganizerCustomers(
      PageRequest.of(0, 10),
      ClerkCustomerSearchRequestDTO.builder().build(),
      organizer.getOid()
    );

    assertEquals(false, customers.getContent().get(0).person().individualised());
    assertEquals(
      false,
      clerkCustomerService.getCustomerDetails(PERSON_OID, organizer.getOid()).person().individualised()
    );
  }

  @Test
  public void testClerkGetsOnrUrl() throws Exception {
    final String onrUrl = HENKILO_UI_URL + "/oppija/" + PERSON_OID + "?permissionCheckService=YKI";
    final var customers = clerkCustomerService.searchClerkCustomers(
      PageRequest.of(0, 10),
      ClerkCustomerSearchRequestDTO.builder().build()
    );

    assertEquals(onrUrl, customers.getContent().get(0).person().onrUrl());
    assertEquals(onrUrl, clerkCustomerService.getClerkCustomerDetails(PERSON_OID).person().onrUrl());
  }

  @Test
  public void testOrganiserGetsNoOnrUrl() throws Exception {
    final var customers = clerkCustomerService.searchOrganizerCustomers(
      PageRequest.of(0, 10),
      ClerkCustomerSearchRequestDTO.builder().build(),
      organizer.getOid()
    );

    assertNull(customers.getContent().get(0).person().onrUrl());
    assertNull(clerkCustomerService.getCustomerDetails(PERSON_OID, organizer.getOid()).person().onrUrl());
  }

  @Test
  public void testClerkFilterReturnsOnlyNotIndividualisedPersons() throws Exception {
    persistIndividualisedPersonWithRegistration();

    final var customers = clerkCustomerService.searchClerkCustomers(
      PageRequest.of(0, 10),
      ClerkCustomerSearchRequestDTO.builder().onlyNotIndividualised(true).build()
    );

    assertEquals(
      List.of(PERSON_OID),
      customers.getContent().stream().map(customer -> customer.person().oid()).toList()
    );
  }

  @Test
  public void testOrganiserSearchIgnoresNotIndividualisedFilter() throws Exception {
    persistIndividualisedPersonWithRegistration();

    final var customers = clerkCustomerService.searchOrganizerCustomers(
      PageRequest.of(0, 10),
      ClerkCustomerSearchRequestDTO.builder().onlyNotIndividualised(true).build(),
      organizer.getOid()
    );

    assertEquals(
      Set.of(PERSON_OID, INDIVIDUALISED_PERSON_OID),
      customers.getContent().stream().map(customer -> customer.person().oid()).collect(Collectors.toSet())
    );
  }

  private void persistIndividualisedPersonWithRegistration() {
    final Person person = Factory.person();
    person.setOid(INDIVIDUALISED_PERSON_OID);
    person.setIndividualised(true);
    person.setOnrLastSyncAt(LocalDateTime.now());
    final Registration registration = Factory.registration(person);
    // setup() cleared the entity manager, so load the participant and the session again.
    registration.setParticipant(entityManager.find(Participant.class, participant.getId()));
    registration.setExamSession(entityManager.find(ExamSession.class, examSession.getId()));

    entityManager.persist(person);
    entityManager.persist(registration);
    entityManager.flush();
    entityManager.clear();
  }
}
