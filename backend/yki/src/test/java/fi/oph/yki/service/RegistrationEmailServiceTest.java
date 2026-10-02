package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.Email;
import fi.oph.yki.model.EmailType;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.LoginLink;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.LoginLinkType;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.EmailRepository;
import fi.oph.yki.repository.LoginLinkRepository;
import fi.oph.yki.util.LocalisationUtil;
import fi.oph.yki.util.StringUtil;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
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
  private LoginLinkRepository loginLinkRepository;

  @Resource
  private Environment environment;

  @Resource
  private EntityManager entityManager;

  @Test
  public void testSendCancelRegistrationEmailForPaidRegistration() {
    final Registration registration = buildRegistration(false, false);

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
  public void testSendCancelRegistrationEmailForStrongAuthRegistration() {
    final Registration registration = buildRegistration(false, true);

    registrationEmailService.sendCancelRegistrationEmail(registration);

    final Email email = emailRepository.findAll().get(0);
    assertTrue(
      email.getBody().contains(environment.getRequiredProperty("app.base-url.public") + "/auth/?toUserPortal=true")
    );
  }

  @Test
  public void testSendCancelRegistrationEmailForNullStrongAuthRegistration() {
    final Registration registration = buildRegistration(false, null);

    registrationEmailService.sendCancelRegistrationEmail(registration);

    final Email email = emailRepository.findAll().get(0);
    assertTrue(email.getBody().contains("/auth/login?code="));
  }

  @Test
  public void testSendCancelRegistrationEmailForFreeRegistration() {
    final Registration registration = buildRegistration(true, false);

    registrationEmailService.sendCancelRegistrationEmail(registration);

    final List<Email> emails = emailRepository.findAll();
    assertEquals(1, emails.size());
    assertEquals(EmailType.CANCEL_FREE_REGISTRATION, emails.get(0).getEmailType());
  }

  @Test
  public void testSkipsSendingWhenPersonHasNoEmailAddress() {
    final Registration registration = buildRegistration(false, false);
    registration.getPerson().setEmail(null);

    registrationEmailService.sendCancelRegistrationEmail(registration);

    assertEquals(0, emailRepository.findAll().size());
  }

  @ParameterizedTest
  @CsvSource(value = { "fi, fi", "sv, sv", "en, en", "NULL, fi" }, nullValues = "NULL")
  public void testSendLiftedFromQueueEmail(final String uiLanguage, final String expectedLang) {
    final Locale locale = Locale.forLanguageTag(expectedLang);
    final Registration registration = buildLiftedRegistration(false, true, uiLanguage);

    registrationEmailService.sendLiftedFromQueueEmail(registration);

    final List<Email> emails = emailRepository.findAll();
    assertEquals(1, emails.size());
    final Email email = emails.get(0);
    assertEquals(EmailType.PAYMENT_FROM_QUEUE, email.getEmailType());
    assertEquals("testi.henkilo@example.com", email.getRecipientAddress());
    assertTrue(
      email.getSubject().startsWith(LocalisationUtil.translate(locale, "email.payment_from_queue.subject") + ": ")
    );
    assertTrue(email.getSubject().endsWith(" - Testipaikka " + expectedLang + ", 15.06.2026"));
    assertTrue(email.getBody().contains("Testipaikka " + expectedLang));
    assertTrue(email.getBody().contains("165,00 €"));
    assertTrue(email.getBody().contains("05.10.2026"));

    final LoginLink paymentLink = loginLinkRepository.findAll().get(0);
    assertEquals(LoginLinkType.PAYMENT, paymentLink.getType());
    assertTrue(paymentLink.getSuccessRedirect().endsWith("/redirect?lang=" + expectedLang));
    assertEquals(registration.getExpiresAt(), paymentLink.getExpiresAt());
    final String publicBaseUrl = environment.getRequiredProperty("app.base-url.public");
    final Matcher loginUrl = Pattern
      .compile(Pattern.quote(publicBaseUrl) + "/auth/login\\?code=([0-9a-f-]+)")
      .matcher(email.getBody());
    assertTrue(loginUrl.find());
    assertEquals(StringUtil.sha256hex(loginUrl.group(1)), paymentLink.getCode());

    assertTrue(email.getBody().contains(publicBaseUrl + "/auth/?toUserPortal=true"));
  }

  @Test
  public void testSendLiftedFromQueueEmailForWeakAuthCreatesUserPortalLink() {
    final Registration registration = buildLiftedRegistration(false, false, "fi");

    registrationEmailService.sendLiftedFromQueueEmail(registration);

    assertEquals(
      Set.of(LoginLinkType.PAYMENT, LoginLinkType.PERSON),
      loginLinkRepository.findAll().stream().map(LoginLink::getType).collect(Collectors.toSet())
    );
    assertFalse(emailRepository.findAll().get(0).getBody().contains("/auth/?toUserPortal=true"));
  }

  @Test
  public void testSendLiftedFromQueueEmailForPartialExamSumsSubtestFees() {
    final Registration registration = buildLiftedRegistration(false, true, "fi");
    registration.getExamSession().setType(ExamSessionType.LISTEN_WRITE);
    registration.getExamSession().setLevel("KESKI");

    registrationEmailService.sendLiftedFromQueueEmail(registration);

    final String body = emailRepository.findAll().get(0).getBody();
    // keski-listen 44.50 + keski-write 70 in application-test-postgres.yaml
    assertTrue(body.contains("114,50 €"));
    assertTrue(
      body.contains(LocalisationUtil.translate(LocalisationUtil.LOCALE_FI, "registration.description.listen"))
    );
    assertTrue(body.contains(LocalisationUtil.translate(LocalisationUtil.LOCALE_FI, "registration.description.write")));
  }

  @Test
  public void testSendLiftedFromQueueForFreeEmail() {
    final Registration registration = buildLiftedRegistration(true, false, "sv");

    registrationEmailService.sendLiftedFromQueueForFreeEmail(registration);

    final List<Email> emails = emailRepository.findAll();
    assertEquals(1, emails.size());
    final Email email = emails.get(0);
    assertEquals(EmailType.FREE_REGISTRATION_FROM_QUEUE, email.getEmailType());
    assertTrue(
      email
        .getSubject()
        .startsWith(
          LocalisationUtil.translate(LocalisationUtil.LOCALE_SV, "email.free_registration_from_queue.subject") + ": "
        )
    );
    assertTrue(email.getBody().contains("Lisätietoa sv"));
    assertTrue(
      email
        .getBody()
        .contains(
          LocalisationUtil.translate(LocalisationUtil.LOCALE_SV, "email.payment_success.organizer_contact.label")
        )
    );
    assertTrue(email.getBody().contains("testi@example.com"));
    assertTrue(email.getBody().contains("0401234567"));
    // Static even for weak authentication, as in legacy.
    assertTrue(
      email.getBody().contains(environment.getRequiredProperty("app.base-url.public") + "/auth/?toUserPortal=true")
    );
    assertEquals(0, loginLinkRepository.count());
  }

  @Test
  public void testSendLiftedFromQueueForFreeEmailWithoutContactInfo() {
    final Registration registration = buildLiftedRegistration(true, true, "fi");
    registration.getExamSession().setContactName(null);
    registration.getExamSession().setContactEmail("");
    registration.getExamSession().setContactPhoneNumber(null);

    registrationEmailService.sendLiftedFromQueueForFreeEmail(registration);

    assertFalse(
      emailRepository
        .findAll()
        .get(0)
        .getBody()
        .contains(
          LocalisationUtil.translate(LocalisationUtil.LOCALE_FI, "email.payment_success.organizer_contact.label")
        )
    );
  }

  @Test
  public void testLiftedFromQueueEmailsSkipPersonWithoutEmailAddress() {
    final Registration paid = buildLiftedRegistration(false, false, "fi");
    paid.getPerson().setEmail(null);

    registrationEmailService.sendLiftedFromQueueEmail(paid);
    registrationEmailService.sendLiftedFromQueueForFreeEmail(paid);

    assertEquals(0, emailRepository.count());
    assertEquals(0, loginLinkRepository.count());
  }

  private Registration buildLiftedRegistration(final boolean free, final Boolean strongAuth, final String uiLanguage) {
    final Person person = Factory.person();
    person.setEmail("testi.henkilo@example.com");

    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.getLocations().addAll(Factory.examSessionLocations(examSession));

    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setStrongAuth(strongAuth);
    registration.setUiLanguage(uiLanguage);
    registration.setLiftedFromQueueAt(LocalDateTime.of(2026, 10, 4, 12, 0));
    // at_midnight('2026-10-05'), i.e. the start of 6.10. in Helsinki, so the last day to pay is 5.10.
    // A LocalDateTime is written in the JVM's zone whatever hibernate.jdbc.time_zone says.
    registration.setExpiresAt(
      ZonedDateTime
        .of(2026, 10, 6, 0, 0, 0, 0, ZoneId.of("Europe/Helsinki"))
        .withZoneSameInstant(ZoneId.systemDefault())
        .toLocalDateTime()
    );

    final Participant participant = Factory.participant("testi.henkilo@example.com");
    registration.setParticipant(participant);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(person);
    entityManager.persist(participant);
    entityManager.persist(registration);

    if (free) {
      registration.setState(RegistrationState.COMPLETED);
      final FreeRegistration freeRegistration = Factory.freeRegistration(registration);
      entityManager.persist(freeRegistration);
      registration.setFreeRegistration(freeRegistration);
    }

    return registration;
  }

  private Registration buildRegistration(final boolean free, final Boolean strongAuth) {
    final Person person = Factory.person();
    person.setEmail("testi.henkilo@example.com");

    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final ExamSessionLocation location = Factory.examSessionLocation(examSession);
    examSession.getLocations().add(location);

    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setStrongAuth(strongAuth);

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
