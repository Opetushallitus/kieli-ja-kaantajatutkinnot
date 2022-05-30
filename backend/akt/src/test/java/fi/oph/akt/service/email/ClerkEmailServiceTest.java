package fi.oph.akt.service.email;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import fi.oph.akt.Factory;
import fi.oph.akt.api.dto.clerk.InformalEmailRequestDTO;
import fi.oph.akt.model.Authorisation;
import fi.oph.akt.model.MeetingDate;
import fi.oph.akt.model.Translator;
import fi.oph.akt.repository.AuthorisationRepository;
import fi.oph.akt.repository.AuthorisationTermReminderRepository;
import fi.oph.akt.repository.EmailRepository;
import fi.oph.akt.repository.MeetingDateRepository;
import fi.oph.akt.repository.TranslatorRepository;
import fi.oph.akt.service.LanguageService;
import fi.oph.akt.util.TemplateRenderer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class ClerkEmailServiceTest {

  private ClerkEmailService clerkEmailService;

  @Resource
  private AuthorisationRepository authorisationRepository;

  @MockBean
  private AuthorisationTermReminderRepository authorisationTermReminderRepository;

  @Resource
  private EmailRepository emailRepository;

  @MockBean
  private EmailService emailService;

  @Resource
  private MeetingDateRepository meetingDateRepository;

  @MockBean
  private TemplateRenderer templateRenderer;

  @Resource
  private TranslatorRepository translatorRepository;

  @Resource
  private TestEntityManager entityManager;

  @Captor
  private ArgumentCaptor<EmailData> emailDataCaptor;

  @BeforeEach
  public void setup() {
    final LanguageService languageService = new LanguageService();
    languageService.init();

    clerkEmailService =
      new ClerkEmailService(
        authorisationRepository,
        authorisationTermReminderRepository,
        emailRepository,
        emailService,
        languageService,
        meetingDateRepository,
        templateRenderer,
        translatorRepository
      );
  }

  @Test
  public void createInformalEmailsShouldSaveEmailsToGivenTranslators() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    final List<Translator> translators = new ArrayList<>();

    IntStream
      .range(0, 3)
      .forEach(i -> {
        final Translator translator = Factory.translator();
        translator.setFirstName("Etu" + i);
        translator.setLastName("Suku" + i);
        translator.setEmail("etu.suku" + i + "@invalid");

        final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

        entityManager.persist(translator);
        entityManager.persist(authorisation);

        translators.add(translator);
      });

    final InformalEmailRequestDTO emailRequestDTO = InformalEmailRequestDTO
      .builder()
      .translatorIds(translators.stream().map(Translator::getId).toList())
      .subject("otsikko")
      .body("viesti")
      .build();

    clerkEmailService.createInformalEmails(emailRequestDTO);

    verify(emailService, times(3)).saveEmail(any(), emailDataCaptor.capture());

    final List<EmailData> emailDatas = emailDataCaptor.getAllValues();

    assertEquals(3, emailDatas.size());

    IntStream
      .range(0, 3)
      .forEach(i -> {
        final Translator translator = translators.get(i);
        final EmailData emailData = emailDatas.get(i);

        assertEquals(translator.getFullName(), emailData.recipientName());
        assertEquals(translator.getEmail(), emailData.recipientAddress());
        assertEquals("otsikko", emailData.subject());
        assertEquals("viesti", emailData.body());
      });
  }

  @Test
  public void createInformalEmailsShouldSaveEmailToGivenTranslatorsWithDuplicateTranslatorIds() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    translator.setEmail("foo.bar@invalid");

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final InformalEmailRequestDTO emailRequestDTO = InformalEmailRequestDTO
      .builder()
      .translatorIds(List.of(translator.getId(), translator.getId()))
      .subject("otsikko")
      .body("viesti")
      .build();

    clerkEmailService.createInformalEmails(emailRequestDTO);

    verify(emailService).saveEmail(any(), emailDataCaptor.capture());
  }

  @Test
  public void createInformalEmailsShouldIgnoreTranslatorsWithoutEmailAddress() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final InformalEmailRequestDTO emailRequestDTO = InformalEmailRequestDTO
      .builder()
      .translatorIds(List.of(translator.getId()))
      .subject("otsikko")
      .body("viesti")
      .build();

    clerkEmailService.createInformalEmails(emailRequestDTO);

    verifyNoInteractions(emailService);
  }

  @Test
  public void createInformalEmailsShouldThrowIllegalArgumentExceptionForNonExistingTranslatorIds() {
    final InformalEmailRequestDTO emailRequestDTO = InformalEmailRequestDTO
      .builder()
      .translatorIds(List.of(1L))
      .subject("otsikko")
      .body("viesti")
      .build();

    assertThrows(IllegalArgumentException.class, () -> clerkEmailService.createInformalEmails(emailRequestDTO));
  }

  @Test
  public void testCreateAuthorisationExpiryEmail() {
    final MeetingDate meetingDate1 = Factory.meetingDate(LocalDate.of(2020, 1, 10));
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.of(2050, 2, 11));
    final MeetingDate meetingDate3 = Factory.meetingDate(LocalDate.of(2060, 3, 12));
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate1);

    translator.setFirstName("Etu");
    translator.setLastName("Suku");
    translator.setEmail("etu.suku@invalid");

    authorisation.setFromLang("SV");
    authorisation.setToLang("EN");
    authorisation.setTermEndDate(LocalDate.of(2049, 12, 1));

    entityManager.persist(meetingDate1);
    entityManager.persist(meetingDate2);
    entityManager.persist(meetingDate3);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final Map<String, Object> expectedTemplateParams = Map.of(
      "translatorName",
      "Etu Suku",
      "langPairFI",
      "ruotsi - englanti",
      "langPairSV",
      "svenska - engelska",
      "expiryDate",
      "01.12.2049",
      "meetingDate1",
      "11.02.2050",
      "meetingDate2",
      "12.03.2060"
    );

    when(templateRenderer.renderAuthorisationExpiryEmailBody(expectedTemplateParams))
      .thenReturn("Auktorisointisi päättyy 01.12.2049");

    clerkEmailService.createAuthorisationExpiryEmail(authorisation.getId());

    verify(emailService).saveEmail(any(), emailDataCaptor.capture());

    final EmailData emailData = emailDataCaptor.getValue();

    assertEquals("Etu Suku", emailData.recipientName());
    assertEquals("etu.suku@invalid", emailData.recipientAddress());
    assertEquals("Auktorisointisi on päättymässä | Din auktorisering går mot sitt slut", emailData.subject());
    assertEquals("Auktorisointisi päättyy 01.12.2049", emailData.body());

    verify(authorisationTermReminderRepository).save(any());
  }

  @Test
  public void testCreateAuthorisationExpiryEmailWithoutUpcomingMeetingDates() {
    final MeetingDate meetingDate = Factory.meetingDate(LocalDate.of(2020, 1, 10));
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    translator.setFirstName("Etu");
    translator.setLastName("Suku");
    translator.setEmail("etu.suku@invalid");

    authorisation.setFromLang("SV");
    authorisation.setToLang("EN");
    authorisation.setTermEndDate(LocalDate.of(2049, 12, 1));

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final Map<String, Object> expectedTemplateParams = Map.of(
      "translatorName",
      "Etu Suku",
      "langPairFI",
      "ruotsi - englanti",
      "langPairSV",
      "svenska - engelska",
      "expiryDate",
      "01.12.2049",
      "meetingDate1",
      "-",
      "meetingDate2",
      "-"
    );

    when(templateRenderer.renderAuthorisationExpiryEmailBody(expectedTemplateParams))
      .thenReturn("Auktorisointisi päättyy 01.12.2049");

    clerkEmailService.createAuthorisationExpiryEmail(authorisation.getId());

    verify(emailService).saveEmail(any(), emailDataCaptor.capture());

    final EmailData emailData = emailDataCaptor.getValue();

    assertEquals("Auktorisointisi päättyy 01.12.2049", emailData.body());
  }

  @Test
  public void testCreateAuthorisationExpiryEmailWithTranslatorWithoutEmailAddress() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    clerkEmailService.createAuthorisationExpiryEmail(authorisation.getId());

    verifyNoInteractions(emailService);
    verifyNoInteractions(authorisationTermReminderRepository);
  }
}
