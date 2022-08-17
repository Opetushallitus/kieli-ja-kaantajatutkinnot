package fi.oph.akr.scheduled;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import fi.oph.akr.Factory;
import fi.oph.akr.model.Authorisation;
import fi.oph.akr.model.AuthorisationTermReminder;
import fi.oph.akr.model.Email;
import fi.oph.akr.model.EmailType;
import fi.oph.akr.model.MeetingDate;
import fi.oph.akr.model.Translator;
import fi.oph.akr.repository.AuthorisationRepository;
import fi.oph.akr.service.email.ClerkEmailService;
import java.time.LocalDate;
import java.util.List;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class ExpiringAuthorisationsEmailCreatorTest {

  private ExpiringAuthorisationsEmailCreator emailCreator;

  @Resource
  private AuthorisationRepository authorisationRepository;

  @MockBean
  private ClerkEmailService clerkEmailService;

  @Resource
  private TestEntityManager entityManager;

  @Captor
  private ArgumentCaptor<Long> longCaptor;

  @BeforeEach
  public void setup() {
    doSetup(true);
  }

  private void doSetup(final boolean createExpiryEmailsEnabled) {
    final Environment environment = mock(Environment.class);
    when(environment.getRequiredProperty("akr.create-expiry-emails-enabled", Boolean.class))
      .thenReturn(createExpiryEmailsEnabled);
    emailCreator = new ExpiringAuthorisationsEmailCreator(authorisationRepository, clerkEmailService, environment);
  }

  @Test
  public void testCheckExpiringAuthorisations() {
    final LocalDate date = LocalDate.now();
    final MeetingDate meetingDate = Factory.meetingDate(date.minusYears(1));
    entityManager.persist(meetingDate);

    final Authorisation auth1 = createAuthorisation(meetingDate, date, "t1@invalid");
    final Authorisation auth2 = createAuthorisation(meetingDate, date.plusDays(10), "t2@invalid");
    final Authorisation auth3 = createAuthorisation(meetingDate, date.plusMonths(3), "t3@invalid");

    final Authorisation expiredAuth = createAuthorisation(meetingDate, date.minusDays(1), "t4@invalid");
    final Authorisation authExpiringLater = createAuthorisation(
      meetingDate,
      date.plusMonths(3).plusDays(1),
      "t5@invalid"
    );
    final Authorisation authForFormerVIR = createAuthorisation(null, null, "t6@invalid");

    final Authorisation remindedAuth1 = createAuthorisation(meetingDate, date.plusMonths(1), "t7@invalid");
    createAuthorisationTermReminder(remindedAuth1);

    final Authorisation remindedAuth2 = createAuthorisation(meetingDate, date.plusMonths(2), "t8@invalid");
    createAuthorisationTermReminder(remindedAuth2);
    createAuthorisationTermReminder(remindedAuth2);

    emailCreator.checkExpiringAuthorisations();

    verify(clerkEmailService, times(3)).createAuthorisationExpiryEmail(longCaptor.capture());

    final List<Long> expiringAuthIds = longCaptor.getAllValues();

    assertEquals(3, expiringAuthIds.size());

    assertTrue(expiringAuthIds.contains(auth1.getId()));
    assertTrue(expiringAuthIds.contains(auth2.getId()));
    assertTrue(expiringAuthIds.contains(auth3.getId()));
  }

  @Test
  public void testCheckExpiringAuthorisationsWithTranslatorWithoutEmailAddress() {
    final MeetingDate meetingDate = Factory.meetingDate(LocalDate.now().minusYears(1));
    entityManager.persist(meetingDate);

    createAuthorisation(meetingDate, LocalDate.now().plusDays(10), null);

    emailCreator.checkExpiringAuthorisations();

    verifyNoInteractions(clerkEmailService);
  }

  @Test
  public void testCheckExpiringAuthorisationsDisabled() {
    doSetup(false);

    final MeetingDate meetingDate = Factory.meetingDate(LocalDate.now().minusYears(1));
    entityManager.persist(meetingDate);

    createAuthorisation(meetingDate, LocalDate.now().plusDays(10), "t1@invalid");

    emailCreator.checkExpiringAuthorisations();

    verifyNoInteractions(clerkEmailService);
  }

  private Authorisation createAuthorisation(
    final MeetingDate meetingDate,
    final LocalDate termEndDate,
    final String translatorEmail
  ) {
    final Translator translator = Factory.translator();
    final Authorisation authorisation = meetingDate != null
      ? Factory.kktAuthorisation(translator, meetingDate)
      : Factory.formerVirAuthorisation(translator);

    translator.setEmail(translatorEmail);
    authorisation.setTermEndDate(termEndDate);

    if (meetingDate != null) {
      entityManager.persist(meetingDate);
    }
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    return authorisation;
  }

  private void createAuthorisationTermReminder(final Authorisation authorisation) {
    final Email email = Factory.email(EmailType.AUTHORISATION_EXPIRY);
    entityManager.persist(email);

    final AuthorisationTermReminder reminder = Factory.authorisationTermReminder(authorisation, email);
    entityManager.persist(reminder);
  }
}
