package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.Email;
import fi.oph.yki.model.EmailType;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.repository.EmailRepository;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@WithMockUser
@SpringBootTest
@ActiveProfiles("test-postgres")
@Import(PostgresTestcontainerConfig.class)
@Transactional
class RegistrationEmailServiceTest {

  @Resource
  private RegistrationEmailService registrationEmailService;

  @Resource
  private EmailRepository emailRepository;

  @Resource
  private Environment environment;

  @Resource
  private EntityManager entityManager;

  @Test
  public void testSendCancelRegistrationEmailForPaidRegistration() {
    final Registration registration = buildRegistration(false);

    registrationEmailService.sendCancelRegistrationEmail(registration);

    final List<Email> emails = emailRepository.findAll();
    assertEquals(1, emails.size());
    final Email email = emails.get(0);
    assertEquals(EmailType.CANCEL_REGISTRATION, email.getEmailType());
    assertEquals("testi.henkilo@example.com", email.getRecipientAddress());
    assertTrue(email.getBody().contains("Testipaikka"));
    assertTrue(email.getBody().contains("15.06.2026"));
    assertTrue(email.getBody().contains("/auth/login?code="));
  }

  @Test
  public void testSendCancelRegistrationEmailForNonEmailAuthParticipant() {
    final Registration registration = buildRegistration(false);
    registration.getParticipant().setExternalUserId("1.2.246.562.24.00000000001");

    registrationEmailService.sendCancelRegistrationEmail(registration);

    final Email email = emailRepository.findAll().get(0);
    assertTrue(
      email.getBody().contains(environment.getRequiredProperty("app.base-url.public") + "/auth/?toUserPortal=true")
    );
  }

  @Test
  public void testSendCancelRegistrationEmailForFreeRegistration() {
    final Registration registration = buildRegistration(true);

    registrationEmailService.sendCancelRegistrationEmail(registration);

    final List<Email> emails = emailRepository.findAll();
    assertEquals(1, emails.size());
    assertEquals(EmailType.CANCEL_FREE_REGISTRATION, emails.get(0).getEmailType());
  }

  @Test
  public void testSkipsSendingWhenPersonHasNoEmailAddress() {
    final Registration registration = buildRegistration(false);
    registration.getPerson().setEmail(null);

    registrationEmailService.sendCancelRegistrationEmail(registration);

    assertEquals(0, emailRepository.findAll().size());
  }

  private Registration buildRegistration(final boolean free) {
    final Person person = Factory.person();
    person.setEmail("testi.henkilo@example.com");

    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final ExamSessionLocation location = Factory.examSessionLocation(examSession);
    examSession.getLocations().add(location);

    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);

    final Participant participant = Factory.participant("testi.henkilo@example.com");
    registration.setParticipant(participant);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(person);
    entityManager.persist(participant);
    entityManager.persist(registration);

    if (free) {
      final FreeRegistration freeRegistration = Factory.freeRegistration(registration);
      entityManager.persist(freeRegistration);
      registration.setFreeRegistration(freeRegistration);
    }

    return registration;
  }
}
