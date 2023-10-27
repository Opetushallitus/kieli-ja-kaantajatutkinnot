package fi.oph.akr.service;

import fi.oph.akr.api.dto.translator.ContactRequestDTO;
import fi.oph.akr.model.ContactRequest;
import fi.oph.akr.model.ContactRequestTranslator;
import fi.oph.akr.model.Email;
import fi.oph.akr.model.EmailType;
import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.OnrService;
import fi.oph.akr.onr.model.PersonalData;
import fi.oph.akr.repository.AuthorisationRepository;
import fi.oph.akr.repository.ContactRequestRepository;
import fi.oph.akr.repository.ContactRequestTranslatorRepository;
import fi.oph.akr.repository.EmailRepository;
import fi.oph.akr.repository.TranslatorRepository;
import fi.oph.akr.service.email.EmailData;
import fi.oph.akr.service.email.EmailService;
import fi.oph.akr.util.MigrationUtil;
import fi.oph.akr.util.TemplateRenderer;
import fi.oph.akr.util.localisation.Language;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactRequestService {

  private static final Logger LOG = LoggerFactory.getLogger(ContactRequestService.class);

  private final AuthorisationRepository authorisationRepository;
  private final ContactRequestRepository contactRequestRepository;
  private final ContactRequestTranslatorRepository contactRequestTranslatorRepository;
  private final EmailRepository emailRepository;
  private final EmailService emailService;
  private final LanguagePairService languagePairService;
  private final TemplateRenderer templateRenderer;
  private final TranslatorRepository translatorRepository;
  private final Environment environment;
  private final OnrService onrService;

  @Transactional
  public ContactRequest createContactRequest(final ContactRequestDTO contactRequestDTO) {
    final Set<Long> translatorIds = new HashSet<>(contactRequestDTO.translatorIds());

    validateContactRequestDTO(contactRequestDTO, translatorIds);

    final List<Translator> translators = translatorRepository.findAllById(translatorIds);
    final Map<String, PersonalData> personalDatas = onrService.getCachedPersonalDatas();
    final List<PersonalData> translatorsPersonalDatas = translators
      .stream()
      .map(t -> {
        // TODO: M.S. after migration is done use:
        //final PersonalData personalData = personalDatas.get(t.getOnrId());
        return MigrationUtil.get(personalDatas.get(t.getOnrId()), t);
      })
      .collect(Collectors.toCollection(ArrayList::new));

    final ContactRequest contactRequest = saveContactRequest(contactRequestDTO);
    saveContactRequestTranslators(translators, contactRequest);
    saveContactRequestEmails(contactRequestDTO, translatorsPersonalDatas, translators);

    return contactRequest;
  }

  private void validateContactRequestDTO(final ContactRequestDTO contactRequestDTO, final Set<Long> translatorIds) {
    final long publicTranslatorsCountByContactRequest = authorisationRepository
      .findTranslatorLanguagePairsForPublicListing()
      .stream()
      .filter(tlp -> translatorIds.contains(tlp.translatorId()))
      .filter(tlp -> tlp.fromLang().equals(contactRequestDTO.fromLang()))
      .filter(tlp -> tlp.toLang().equals(contactRequestDTO.toLang()))
      .count();

    if (publicTranslatorsCountByContactRequest != translatorIds.size()) {
      throw new IllegalArgumentException("Invalid contact request");
    }
  }

  private ContactRequest saveContactRequest(final ContactRequestDTO contactRequestDTO) {
    final ContactRequest contactRequest = new ContactRequest();

    contactRequest.setFirstName(contactRequestDTO.firstName());
    contactRequest.setLastName(contactRequestDTO.lastName());
    contactRequest.setEmail(contactRequestDTO.email());
    contactRequest.setPhoneNumber(contactRequestDTO.phoneNumber());
    contactRequest.setMessage(contactRequestDTO.message());
    contactRequest.setFromLang(contactRequestDTO.fromLang());
    contactRequest.setToLang(contactRequestDTO.toLang());

    return contactRequestRepository.save(contactRequest);
  }

  private void saveContactRequestTranslators(final List<Translator> translators, final ContactRequest contactRequest) {
    final List<ContactRequestTranslator> contactRequestTranslators = translators
      .stream()
      .map(translator -> {
        final ContactRequestTranslator contactRequestTranslator = new ContactRequestTranslator();
        contactRequestTranslator.setContactRequest(contactRequest);
        contactRequestTranslator.setTranslator(translator);

        return contactRequestTranslator;
      })
      .toList();

    contactRequestTranslatorRepository.saveAll(contactRequestTranslators);
  }

  private void saveContactRequestEmails(
    final ContactRequestDTO contactRequestDTO,
    final List<PersonalData> translatorsPersonalDatas,
    final List<Translator> translators
  ) {
    final List<PersonalData> translatorsPersonalDatasWithEmail = translatorsPersonalDatas
      .stream()
      .filter(t -> t.getEmail() != null)
      .collect(Collectors.toCollection(ArrayList::new));

    final List<PersonalData> translatorsPersonalDatasWithoutEmail = translatorsPersonalDatas
      .stream()
      .filter(t -> t.getEmail() == null)
      .collect(Collectors.toCollection(ArrayList::new));

    sendTranslatorEmails(translatorsPersonalDatasWithEmail, contactRequestDTO);
    sendRequesterEmail(translatorsPersonalDatas, contactRequestDTO);

    if (!translatorsPersonalDatasWithoutEmail.isEmpty()) {
      sendClerkEmail(translators, contactRequestDTO);
    }
  }

  private void sendTranslatorEmails(
    final List<PersonalData> translatorsPersonalDatas,
    final ContactRequestDTO contactRequestDTO
  ) {
    final Map<String, Object> templateParams = Map.of(
      "langPairFI",
      getLangPair(contactRequestDTO, Language.FI),
      "langPairSV",
      getLangPair(contactRequestDTO, Language.SV),
      "requesterName",
      getRequesterName(contactRequestDTO),
      "requesterEmail",
      getRequesterEmail(contactRequestDTO),
      "requesterPhone",
      getRequesterPhone(contactRequestDTO),
      "messageLines",
      getMessageLines(contactRequestDTO)
    );

    final String subject =
      "Yhteydenotto auktorisoitujen kääntäjien rekisteristä | Kontaktförfrågan från registret över auktoriserade translatorer";
    final String body = templateRenderer.renderContactRequestTranslatorEmailBody(templateParams);

    translatorsPersonalDatas.forEach(translator -> {
      final String recipientName = translator.getFirstName() + " " + translator.getLastName();
      final String recipientAddress = translator.getEmail();

      createEmail(recipientName, recipientAddress, subject, body, EmailType.CONTACT_REQUEST_TRANSLATOR);
    });
  }

  private void sendRequesterEmail(
    final List<PersonalData> translatorsPersonalDatas,
    final ContactRequestDTO contactRequestDTO
  ) {
    final String requesterName = getRequesterName(contactRequestDTO);
    final String requesterEmail = getRequesterEmail(contactRequestDTO);

    final Map<String, Object> templateParams = Map.of(
      "translators",
      translatorsPersonalDatas.stream().map(t -> t.getFirstName() + " " + t.getLastName()).sorted().toList(),
      "langPairFI",
      getLangPair(contactRequestDTO, Language.FI),
      "langPairSV",
      getLangPair(contactRequestDTO, Language.SV),
      "langPairEN",
      getLangPair(contactRequestDTO, Language.EN),
      "requesterName",
      getRequesterName(contactRequestDTO),
      "requesterEmail",
      getRequesterEmail(contactRequestDTO),
      "requesterPhone",
      getRequesterPhone(contactRequestDTO),
      "messageLines",
      getMessageLines(contactRequestDTO)
    );

    final String subject = "Lähettämäsi yhteydenottopyyntö | Din kontaktförfrågan | Request for contact";
    final String body = templateRenderer.renderContactRequestRequesterEmailBody(templateParams);

    createEmail(requesterName, requesterEmail, subject, body, EmailType.CONTACT_REQUEST_REQUESTER);
  }

  private void sendClerkEmail(final List<Translator> translators, final ContactRequestDTO contactRequestDTO) {
    final Map<String, PersonalData> personalDatas = onrService.getCachedPersonalDatas();
    final List<Map<String, String>> translatorParams = translators
      .stream()
      .map(t -> {
        // TODO: M.S. after migration is done use:
        //final PersonalData personalData = personalDatas.get(t.getOnrId());
        final PersonalData personalData = MigrationUtil.get(personalDatas.get(t.getOnrId()), t);
        final String fullName = personalData.getFirstName() + " " + personalData.getLastName();
        return Map.of("id", "" + t.getId(), "name", fullName);
      })
      .toList();

    final String requesterPhone = getRequesterPhone(contactRequestDTO);

    final Map<String, Object> templateParams = Map.of(
      "translators",
      translatorParams,
      "langPairFI",
      getLangPair(contactRequestDTO, Language.FI),
      "requesterName",
      getRequesterName(contactRequestDTO),
      "requesterEmail",
      getRequesterEmail(contactRequestDTO),
      "requesterPhone",
      requesterPhone.isEmpty() ? "-" : requesterPhone,
      "akrHost",
      environment.getRequiredProperty("host.virkailija")
    );

    final String recipientName = "Auktorisoitujen kääntäjien tutkintolautakunta";
    final String recipientAddress = "auktoris.lautakunta@oph.fi";
    final String subject = "Yhteydenotto kääntäjään jonka sähköposti ei tiedossa";
    final String body = templateRenderer.renderContactRequestClerkEmailBody(templateParams);

    createEmail(recipientName, recipientAddress, subject, body, EmailType.CONTACT_REQUEST_CLERK);
  }

  private String getLangPair(final ContactRequestDTO contactRequestDTO, final Language language) {
    return languagePairService.getLanguagePairLocalisation(
      contactRequestDTO.fromLang(),
      contactRequestDTO.toLang(),
      language
    );
  }

  private String getRequesterName(final ContactRequestDTO contactRequestDTO) {
    return contactRequestDTO.firstName() + " " + contactRequestDTO.lastName();
  }

  private String getRequesterEmail(final ContactRequestDTO contactRequestDTO) {
    return contactRequestDTO.email();
  }

  private String getRequesterPhone(final ContactRequestDTO contactRequestDTO) {
    return contactRequestDTO.phoneNumber() != null ? contactRequestDTO.phoneNumber() : "";
  }

  private String[] getMessageLines(final ContactRequestDTO contactRequestDTO) {
    return contactRequestDTO.message().split("\r?\n");
  }

  private void createEmail(
    final String recipientName,
    final String recipientAddress,
    final String subject,
    final String body,
    final EmailType emailType
  ) {
    final EmailData emailData = EmailData
      .builder()
      .recipientName(recipientName)
      .recipientAddress(recipientAddress)
      .subject(subject)
      .body(body)
      .build();

    emailService.saveEmail(emailType, emailData);
  }

  @Transactional
  public void destroyObsoleteContactRequests(final LocalDateTime createdBefore) {
    final List<ContactRequest> contactRequestsToDelete = contactRequestRepository.findObsoleteContactRequests(
      createdBefore
    );
    final List<ContactRequestTranslator> contactRequestTranslatorsToDelete = contactRequestsToDelete
      .stream()
      .flatMap(cr -> cr.getContactRequestTranslators().stream())
      .toList();

    if (!contactRequestsToDelete.isEmpty()) {
      LOG.info("Deleting {} obsolete contact requests", contactRequestsToDelete.size());
      contactRequestTranslatorRepository.deleteAllInBatch(contactRequestTranslatorsToDelete);
      contactRequestRepository.deleteAllInBatch(contactRequestsToDelete);
    }

    destroyObsoleteContactRequestEmails(createdBefore);
  }

  /**
   * Deletes obsolete contact request emails from OTR database.
   * Doesn't touch emails saved in viestintapalvelu db.
   */
  private void destroyObsoleteContactRequestEmails(final LocalDateTime createdBefore) {
    final List<EmailType> contactRequestEmailTypes = List.of(
      EmailType.CONTACT_REQUEST_REQUESTER,
      EmailType.CONTACT_REQUEST_TRANSLATOR,
      EmailType.CONTACT_REQUEST_CLERK
    );
    final List<Email> emailsToDelete = emailRepository.findObsoleteEmails(createdBefore, contactRequestEmailTypes);

    if (!emailsToDelete.isEmpty()) {
      LOG.info("Deleting {} emails related to obsolete contact requests", emailsToDelete.size());
      emailRepository.deleteAllInBatch(emailsToDelete);
    }
  }
}
