package fi.oph.akt.service;

import fi.oph.akt.api.dto.translator.ContactRequestDTO;
import fi.oph.akt.model.ContactRequest;
import fi.oph.akt.model.ContactRequestTranslator;
import fi.oph.akt.model.EmailType;
import fi.oph.akt.model.Translator;
import fi.oph.akt.repository.AuthorisationRepository;
import fi.oph.akt.repository.ContactRequestRepository;
import fi.oph.akt.repository.ContactRequestTranslatorRepository;
import fi.oph.akt.repository.TranslatorRepository;
import fi.oph.akt.service.email.EmailData;
import fi.oph.akt.service.email.EmailService;
import fi.oph.akt.util.TemplateRenderer;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactRequestService {

  @Resource
  private final AuthorisationRepository authorisationRepository;

  @Resource
  private final ContactRequestRepository contactRequestRepository;

  @Resource
  private final ContactRequestTranslatorRepository contactRequestTranslatorRepository;

  @Resource
  private final EmailService emailService;

  @Resource
  private final TemplateRenderer templateRenderer;

  @Resource
  private final TranslatorRepository translatorRepository;

  @Resource
  private final Environment environment;

  @Transactional
  public ContactRequest createContactRequest(final ContactRequestDTO contactRequestDTO) {
    final Set<Long> translatorIds = new HashSet<>(contactRequestDTO.translatorIds());

    validateContactRequestDTO(contactRequestDTO, translatorIds);

    final List<Translator> translators = translatorRepository.findAllById(translatorIds);

    final ContactRequest contactRequest = saveContactRequest(contactRequestDTO);
    saveContactRequestTranslators(translators, contactRequest);
    saveContactRequestEmails(contactRequestDTO, translators);

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

  private void saveContactRequestEmails(final ContactRequestDTO contactRequestDTO, final List<Translator> translators) {
    final Map<Boolean, List<Translator>> translatorsByExistingEmail = translators
      .stream()
      .collect(Collectors.partitioningBy(t -> Objects.nonNull(t.getEmail())));

    final List<Translator> translatorsWithEmail = translatorsByExistingEmail.get(true);
    final List<Translator> translatorsWithoutEmail = translatorsByExistingEmail.get(false);

    sendTranslatorEmails(translatorsWithEmail, contactRequestDTO);
    sendRequesterEmail(translators, contactRequestDTO);

    if (!translatorsWithoutEmail.isEmpty()) {
      sendClerkEmail(translatorsWithoutEmail, contactRequestDTO);
    }
  }

  private void sendTranslatorEmails(final List<Translator> translators, final ContactRequestDTO contactRequestDTO) {
    final Map<String, Object> templateParams = Map.of(
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

    translators.forEach(translator -> {
      final String recipientName = translator.getFullName();
      final String recipientAddress = translator.getEmail();

      createEmail(recipientName, recipientAddress, subject, body, EmailType.CONTACT_REQUEST_TRANSLATOR);
    });
  }

  private void sendRequesterEmail(final List<Translator> translators, final ContactRequestDTO contactRequestDTO) {
    final String requesterName = getRequesterName(contactRequestDTO);
    final String requesterEmail = getRequesterEmail(contactRequestDTO);

    final Map<String, Object> templateParams = Map.of(
      "translators",
      translators.stream().map(Translator::getFullName).sorted().toList(),
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

  private void sendClerkEmail(final List<Translator> translators, ContactRequestDTO contactRequestDTO) {
    final List<Map<String, String>> translatorParams = translators
      .stream()
      .map(t -> Map.of("id", "" + t.getId(), "name", t.getFullName()))
      .toList();

    final String requesterPhone = getRequesterPhone(contactRequestDTO);

    final Map<String, Object> templateParams = Map.of(
      "translators",
      translatorParams,
      "requesterName",
      getRequesterName(contactRequestDTO),
      "requesterEmail",
      getRequesterEmail(contactRequestDTO),
      "requesterPhone",
      requesterPhone.isEmpty() ? "-" : requesterPhone,
      "aktHost",
      environment.getRequiredProperty("host-virkailija")
    );

    final String recipientName = "Auktorisoitujen kääntäjien tutkintolautakunta";
    final String recipientAddress = "auktoris.lautakunta@oph.fi";
    final String subject = "Yhteydenotto kääntäjään jonka sähköposti ei tiedossa";
    final String body = templateRenderer.renderContactRequestClerkEmailBody(templateParams);

    createEmail(recipientName, recipientAddress, subject, body, EmailType.CONTACT_REQUEST_CLERK);
  }

  private String getRequesterName(final ContactRequestDTO contactRequestDTO) {
    return contactRequestDTO.firstName().trim() + " " + contactRequestDTO.lastName().trim();
  }

  private String getRequesterEmail(final ContactRequestDTO contactRequestDTO) {
    return contactRequestDTO.email().trim();
  }

  private String getRequesterPhone(final ContactRequestDTO contactRequestDTO) {
    return contactRequestDTO.phoneNumber() != null ? contactRequestDTO.phoneNumber().trim() : "";
  }

  private String[] getMessageLines(final ContactRequestDTO contactRequestDTO) {
    return contactRequestDTO.message().trim().split("\r?\n");
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
}
