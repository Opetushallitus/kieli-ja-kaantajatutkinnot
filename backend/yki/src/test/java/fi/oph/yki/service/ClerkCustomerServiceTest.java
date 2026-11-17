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

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
class ClerkCustomerServiceTest {

  // The OID of Factory.person().
  private static final String PERSON_OID = "1.2.3.4.5";

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

  @BeforeEach
  public void setup() throws Exception {
    final AuditService auditService = new AuditService(
      new Audit(new LoggerImpl(), Constants.SERVICENAME, ApplicationType.VIRKAILIJA)
    );
    clerkCustomerService =
      new ClerkCustomerService(personRepository, organizerRepository, registrationRepository, onrService, auditService);
    when(onrService.getPersonalData(PERSON_OID)).thenReturn(new PersonalDataDTO());

    // A person whom ONR has not individualised, with one registration to the organiser's session.
    organizer = Factory.organizer();
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setOrganizer(organizer);
    final Person person = Factory.person();
    person.setIndividualised(false);
    person.setOnrLastSyncAt(LocalDateTime.now());
    final Participant participant = Factory.participant("test@example.com");
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
  public void testOrganiserDoesNotGetIndividualisedStatus() throws Exception {
    final var customers = clerkCustomerService.searchOrganizerCustomers(
      PageRequest.of(0, 10),
      ClerkCustomerSearchRequestDTO.builder().build(),
      organizer.getOid()
    );

    assertNull(customers.getContent().get(0).person().individualised());
    assertNull(clerkCustomerService.getCustomerDetails(PERSON_OID, organizer.getOid()).person().individualised());
  }
}
