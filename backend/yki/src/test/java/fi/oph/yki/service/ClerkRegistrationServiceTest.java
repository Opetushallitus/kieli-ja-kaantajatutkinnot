package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.OrganizerRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import jakarta.annotation.Resource;
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
class ClerkRegistrationServiceTest {

  @Resource
  private RegistrationRepository registrationRepository;

  @Resource
  private ExamSessionRepository examSessionRepository;

  @Resource
  private PersonRepository personRepository;

  @Resource
  private OrganizerRepository organizerRepository;

  @MockitoBean
  private AuditService auditService;

  @MockitoBean
  private RegistrationEmailService registrationEmailService;

  @Resource
  private TestEntityManager entityManager;

  private ClerkRegistrationService clerkRegistrationService;

  @BeforeEach
  public void setup() {
    clerkRegistrationService =
      new ClerkRegistrationService(
        registrationRepository,
        examSessionRepository,
        auditService,
        personRepository,
        registrationEmailService
      );
  }

  @Test
  public void testCancelCompletedRegistrationBecomesPaidAndCancelledAndSendsEmail() {
    final Registration registration = persistRegistration(RegistrationState.COMPLETED);

    clerkRegistrationService.cancelRegistration(registration.getId());
    entityManager.flush();
    entityManager.clear();

    final Registration updated = registrationRepository.getReferenceById(registration.getId());
    assertEquals(RegistrationState.PAID_AND_CANCELLED, updated.getState());

    verify(registrationEmailService).sendCancelRegistrationEmail(registration);
  }

  @Test
  public void testCancelSubmittedRegistrationBecomesCancelledAndDoesNotSendEmail() {
    final Registration registration = persistRegistration(RegistrationState.SUBMITTED);

    clerkRegistrationService.cancelRegistration(registration.getId());
    entityManager.flush();
    entityManager.clear();

    final Registration updated = registrationRepository.getReferenceById(registration.getId());
    assertEquals(RegistrationState.CANCELLED, updated.getState());

    verifyNoInteractions(registrationEmailService);
  }

  @Test
  public void testCancelRegistrationWithMatchingOrganizerOidSucceeds() {
    final Organizer organizer = Factory.organizer();
    entityManager.persist(organizer);

    final Registration registration = persistRegistration(RegistrationState.COMPLETED);
    registration.getExamSession().setOrganizer(organizer);
    entityManager.flush();
    entityManager.clear();

    clerkRegistrationService.cancelRegistration(organizer.getOid(), registration.getId());
    entityManager.flush();
    entityManager.clear();

    final Registration updated = registrationRepository.getReferenceById(registration.getId());
    assertEquals(RegistrationState.PAID_AND_CANCELLED, updated.getState());
  }

  @Test
  public void testCancelRegistrationWithMismatchedOrganizerOidThrows() {
    final Organizer organizer = Factory.organizer();
    entityManager.persist(organizer);

    final Registration registration = persistRegistration(RegistrationState.COMPLETED);
    registration.getExamSession().setOrganizer(organizer);
    entityManager.flush();
    entityManager.clear();

    assertThrows(
      AccessDeniedException.class,
      () -> clerkRegistrationService.cancelRegistration("some-other-oid", registration.getId())
    );

    verifyNoInteractions(registrationEmailService);
  }

  private Registration persistRegistration(final RegistrationState state) {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setState(state);

    entityManager.persist(person);
    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(registration);
    entityManager.flush();

    return registration;
  }
}
