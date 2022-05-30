package fi.oph.akt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.akt.Factory;
import fi.oph.akt.api.dto.translator.ContactRequestDTO;
import fi.oph.akt.model.Authorisation;
import fi.oph.akt.model.ContactRequest;
import fi.oph.akt.model.ContactRequestTranslator;
import fi.oph.akt.model.MeetingDate;
import fi.oph.akt.model.Translator;
import fi.oph.akt.repository.AuthorisationRepository;
import fi.oph.akt.repository.ContactRequestRepository;
import fi.oph.akt.repository.ContactRequestTranslatorRepository;
import fi.oph.akt.repository.TranslatorRepository;
import fi.oph.akt.service.email.EmailData;
import fi.oph.akt.service.email.EmailService;
import fi.oph.akt.util.TemplateRenderer;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
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
class ContactRequestServiceTest {

  private static final String FROM_LANG = "DE";

  private static final String TO_LANG = "SV";

  private static final String OTHER_LANG = "FI";

  private ContactRequestService contactRequestService;

  @Resource
  private AuthorisationRepository authorisationRepository;

  @Resource
  private ContactRequestRepository contactRequestRepository;

  @Resource
  private ContactRequestTranslatorRepository contactRequestTranslatorRepository;

  @MockBean
  private EmailService emailService;

  @MockBean
  private TemplateRenderer templateRenderer;

  @Resource
  private TranslatorRepository translatorRepository;

  @Resource
  private Environment environment;

  @Resource
  private TestEntityManager entityManager;

  @Captor
  private ArgumentCaptor<EmailData> emailDataCaptor;

  @BeforeEach
  public void setup() {
    when(templateRenderer.renderContactRequestTranslatorEmailBody(any())).thenReturn("<html>translator</html>");
    when(templateRenderer.renderContactRequestRequesterEmailBody(any())).thenReturn("<html>requester</html>");
    when(templateRenderer.renderContactRequestClerkEmailBody(any())).thenReturn("<html>clerk</html>");

    contactRequestService =
      new ContactRequestService(
        authorisationRepository,
        contactRequestRepository,
        contactRequestTranslatorRepository,
        emailService,
        templateRenderer,
        translatorRepository,
        environment
      );
  }

  @Test
  public void createContactRequestShouldSaveValidRequest() {
    final MeetingDate meetingDate = createMeetingDate();
    final List<Long> translatorIds = initTranslators(meetingDate, 3);

    final ContactRequestDTO contactRequestDTO = createContactRequestDTO(translatorIds, FROM_LANG, TO_LANG);

    ContactRequest contactRequest = contactRequestService.createContactRequest(contactRequestDTO);
    List<ContactRequestTranslator> contactRequestTranslators = contactRequestTranslatorRepository.findAll();

    assertEquals(contactRequestDTO.firstName(), contactRequest.getFirstName());
    assertEquals(contactRequestDTO.lastName(), contactRequest.getLastName());
    assertEquals(contactRequestDTO.email(), contactRequest.getEmail());
    assertEquals(contactRequestDTO.phoneNumber(), contactRequest.getPhoneNumber());
    assertEquals(contactRequestDTO.message(), contactRequest.getMessage());
    assertEquals(contactRequestDTO.fromLang(), contactRequest.getFromLang());
    assertEquals(contactRequestDTO.toLang(), contactRequest.getToLang());

    assertEquals(3, contactRequestTranslators.size());

    contactRequestTranslators.forEach(ctr -> {
      assertEquals(contactRequest.getId(), ctr.getContactRequest().getId());
    });

    assertEquals(
      Set.copyOf(translatorIds),
      contactRequestTranslators
        .stream()
        .map(ContactRequestTranslator::getTranslator)
        .map(Translator::getId)
        .collect(Collectors.toSet())
    );
  }

  @Test
  public void createContactRequestShouldSaveEmailsToTranslatorsAndRequester() {
    final MeetingDate meetingDate = createMeetingDate();
    final List<Long> translatorIds = initTranslators(meetingDate, 2);

    final ContactRequestDTO contactRequestDTO = createContactRequestDTO(translatorIds, FROM_LANG, TO_LANG);

    contactRequestService.createContactRequest(contactRequestDTO);

    verify(emailService, times(3)).saveEmail(any(), emailDataCaptor.capture());

    final List<Translator> translators = translatorRepository.findAllById(translatorIds);
    final List<EmailData> emailDatas = emailDataCaptor.getAllValues();

    assertEquals(2, translators.size());
    assertEquals(3, emailDatas.size());

    translators.forEach(t ->
      assertEquals(
        1,
        emailDatas
          .stream()
          .filter(e -> e.recipientName().equals(t.getFullName()))
          .filter(e -> e.recipientAddress().equals(t.getEmail()))
          .filter(e ->
            e
              .subject()
              .equals(
                "Yhteydenotto auktorisoitujen kääntäjien rekisteristä | Kontaktförfrågan från registret över auktoriserade translatorer"
              )
          )
          .filter(e -> e.body().equals("<html>translator</html>"))
          .count()
      )
    );

    assertEquals(
      1,
      emailDatas
        .stream()
        .filter(e -> e.recipientName().equals("Sean Sender"))
        .filter(e -> e.recipientAddress().equals("sean.sender@invalid"))
        .filter(e -> e.subject().equals("Lähettämäsi yhteydenottopyyntö | Din kontaktförfrågan | Request for contact"))
        .filter(e -> e.body().equals("<html>requester</html>"))
        .count()
    );
  }

  @Test
  public void createContactRequestShouldSaveClerkEmailIfContactedTranslatorDoesntHaveEmailAddress() {
    final MeetingDate meetingDate = createMeetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    authorisation.setFromLang(FROM_LANG);
    authorisation.setToLang(TO_LANG);

    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final List<Long> translatorIds = List.of(translator.getId());

    final ContactRequestDTO contactRequestDTO = createContactRequestDTO(translatorIds, FROM_LANG, TO_LANG);

    contactRequestService.createContactRequest(contactRequestDTO);

    verify(emailService, times(2)).saveEmail(any(), emailDataCaptor.capture());

    final List<EmailData> emailDatas = emailDataCaptor.getAllValues();

    assertEquals(2, emailDatas.size());

    assertEquals(
      1,
      emailDatas
        .stream()
        .filter(e -> e.recipientName().equals("Sean Sender"))
        .filter(e -> e.recipientAddress().equals("sean.sender@invalid"))
        .filter(e -> e.subject().equals("Lähettämäsi yhteydenottopyyntö | Din kontaktförfrågan | Request for contact"))
        .filter(e -> e.body().equals("<html>requester</html>"))
        .count()
    );

    assertEquals(
      1,
      emailDatas
        .stream()
        .filter(e -> e.recipientName().equals("Auktorisoitujen kääntäjien tutkintolautakunta"))
        .filter(e -> e.recipientAddress().equals("auktoris.lautakunta@oph.fi"))
        .filter(e -> e.subject().equals("Yhteydenotto kääntäjään jonka sähköposti ei tiedossa"))
        .filter(e -> e.body().equals("<html>clerk</html>"))
        .count()
    );
  }

  @Test
  public void createContactRequestShouldSaveValidRequestWithDuplicateTranslatorIds() {
    final MeetingDate meetingDate = createMeetingDate();
    final List<Long> translatorIds = initTranslators(meetingDate, 1);

    final List<Long> duplicateTranslatorIds = List.of(translatorIds.get(0), translatorIds.get(0));

    final ContactRequestDTO contactRequestDTO = createContactRequestDTO(duplicateTranslatorIds, FROM_LANG, TO_LANG);

    final ContactRequest contactRequest = contactRequestService.createContactRequest(contactRequestDTO);
    final List<ContactRequestTranslator> contactRequestTranslators = contactRequestTranslatorRepository.findAll();

    assertEquals(contactRequestDTO.message(), contactRequest.getMessage());

    assertEquals(1, contactRequestTranslators.size());

    final ContactRequestTranslator ctr = contactRequestTranslators.get(0);

    assertEquals(contactRequest.getId(), ctr.getContactRequest().getId());
    assertEquals(translatorIds.get(0), ctr.getTranslator().getId());
  }

  @Test
  public void createContactRequestShouldThrowIllegalArgumentExceptionIfSomeContactedTranslatorsAreNotPubliclyListed() {
    final MeetingDate meetingDate = createMeetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    authorisation.setFromLang(FROM_LANG);
    authorisation.setToLang(TO_LANG);
    authorisation.setPermissionToPublish(false);

    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final List<Long> translatorIds = List.of(translator.getId());

    final ContactRequestDTO contactRequestDTO = createContactRequestDTO(translatorIds, FROM_LANG, TO_LANG);

    final IllegalArgumentException ex = assertThrows(
      IllegalArgumentException.class,
      () -> contactRequestService.createContactRequest(contactRequestDTO)
    );

    assertEquals("Invalid contact request", ex.getMessage());
  }

  @Test
  public void createContactRequestShouldThrowIllegalArgumentExceptionIfSomeTranslatorsArentAuthorisedWithGivenFromLang() {
    final MeetingDate meetingDate = createMeetingDate();
    final List<Long> translatorIds = initTranslators(meetingDate, 1);

    final ContactRequestDTO contactRequestDTO = createContactRequestDTO(translatorIds, OTHER_LANG, TO_LANG);

    final IllegalArgumentException ex = assertThrows(
      IllegalArgumentException.class,
      () -> contactRequestService.createContactRequest(contactRequestDTO)
    );

    assertEquals("Invalid contact request", ex.getMessage());
  }

  @Test
  public void createContactRequestShouldThrowIllegalArgumentExceptionIfSomeTranslatorsArentAuthorisedWithGivenToLang() {
    final MeetingDate meetingDate = createMeetingDate();
    final List<Long> translatorIds = initTranslators(meetingDate, 1);

    final ContactRequestDTO contactRequestDTO = createContactRequestDTO(translatorIds, FROM_LANG, OTHER_LANG);

    final IllegalArgumentException ex = assertThrows(
      IllegalArgumentException.class,
      () -> contactRequestService.createContactRequest(contactRequestDTO)
    );

    assertEquals("Invalid contact request", ex.getMessage());
  }

  private MeetingDate createMeetingDate() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    return meetingDate;
  }

  private List<Long> initTranslators(final MeetingDate meetingDate, final int size) {
    List<Long> translatorIds = new ArrayList<>();

    IntStream
      .range(0, size)
      .forEach(i -> {
        final Translator translator = Factory.translator();
        translator.setFirstName("Etu" + i);
        translator.setLastName("Suku" + i);
        translator.setEmail("etu.suku" + i + "@invalid");

        final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);
        authorisation.setFromLang(FROM_LANG);
        authorisation.setToLang(TO_LANG);

        entityManager.persist(translator);
        entityManager.persist(authorisation);

        translatorIds.add(translator.getId());
      });

    return translatorIds;
  }

  private ContactRequestDTO createContactRequestDTO(
    final List<Long> translatorIds,
    final String fromLang,
    final String toLang
  ) {
    return ContactRequestDTO
      .builder()
      .firstName("Sean")
      .lastName("Sender")
      .email("sean.sender@invalid")
      .phoneNumber("+358123")
      .message("lorem ipsum")
      .fromLang(fromLang)
      .toLang(toLang)
      .translatorIds(translatorIds)
      .build();
  }
}
