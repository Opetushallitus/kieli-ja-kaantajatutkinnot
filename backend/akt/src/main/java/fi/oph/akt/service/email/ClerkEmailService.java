package fi.oph.akt.service.email;

import fi.oph.akt.api.dto.clerk.InformalEmailRequestDTO;
import fi.oph.akt.model.Authorisation;
import fi.oph.akt.model.AuthorisationTermReminder;
import fi.oph.akt.model.Email;
import fi.oph.akt.model.EmailType;
import fi.oph.akt.model.MeetingDate;
import fi.oph.akt.model.Translator;
import fi.oph.akt.repository.AuthorisationRepository;
import fi.oph.akt.repository.AuthorisationTermReminderRepository;
import fi.oph.akt.repository.EmailRepository;
import fi.oph.akt.repository.MeetingDateRepository;
import fi.oph.akt.repository.TranslatorRepository;
import fi.oph.akt.service.LanguageService;
import fi.oph.akt.util.TemplateRenderer;
import fi.oph.akt.util.localisation.Language;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkEmailService {

  private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");

  @Resource
  private final AuthorisationRepository authorisationRepository;

  @Resource
  private final AuthorisationTermReminderRepository authorisationTermReminderRepository;

  @Resource
  private final EmailRepository emailRepository;

  @Resource
  private final EmailService emailService;

  @Resource
  private final LanguageService languageService;

  @Resource
  private final MeetingDateRepository meetingDateRepository;

  @Resource
  private final TemplateRenderer templateRenderer;

  @Resource
  private final TranslatorRepository translatorRepository;

  @Transactional
  public void createInformalEmails(final InformalEmailRequestDTO emailRequestDTO) {
    final List<Long> distinctTranslatorIds = emailRequestDTO.translatorIds().stream().distinct().toList();
    final List<Translator> translators = translatorRepository.findAllById(distinctTranslatorIds);

    if (translators.size() != distinctTranslatorIds.size()) {
      throw new IllegalArgumentException("Each translator by provided translatorIds not found");
    }

    translators.forEach(translator ->
      Optional
        .ofNullable(translator.getEmail())
        .ifPresent(recipientAddress -> {
          final String recipientName = translator.getFullName();

          createEmail(
            recipientName,
            recipientAddress,
            emailRequestDTO.subject(),
            emailRequestDTO.body(),
            EmailType.INFORMAL
          );
        })
    );
  }

  private Long createEmail(
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

    return emailService.saveEmail(emailType, emailData);
  }

  @Transactional
  public void createAuthorisationExpiryEmail(final long authorisationId) {
    authorisationRepository.findById(authorisationId).ifPresent(this::createAuthorisationExpiryData);
  }

  private void createAuthorisationExpiryData(final Authorisation authorisation) {
    final Translator translator = authorisation.getTranslator();

    Optional
      .ofNullable(translator.getEmail())
      .ifPresent(recipientAddress -> {
        final String recipientName = translator.getFullName();

        final String emailSubject = "Auktorisointisi on päättymässä";

        final String emailBody = getAuthorisationExpiryEmailBody(
          recipientName,
          authorisation.getFromLang(),
          authorisation.getToLang(),
          authorisation.getTermEndDate()
        );

        final Long emailId = createEmail(
          recipientName,
          recipientAddress,
          emailSubject,
          emailBody,
          EmailType.AUTHORISATION_EXPIRY
        );

        final Email email = emailRepository.getById(emailId);

        createAuthorisationTermReminder(authorisation, email);
      });
  }

  private String getAuthorisationExpiryEmailBody(
    final String translatorName,
    final String fromLangCode,
    final String toLangCode,
    final LocalDate expiryDate
  ) {
    final String langPair =
      languageService.getLocalisationValue(fromLangCode, Language.FI).orElse(fromLangCode) +
      " - " +
      languageService.getLocalisationValue(toLangCode, Language.FI).orElse(toLangCode);

    final Optional<LocalDate> nextMeetingDateOption = meetingDateRepository
      .findAllByOrderByDateAsc()
      .stream()
      .map(MeetingDate::getDate)
      .filter(date -> date.isAfter(LocalDate.now()))
      .findFirst();

    final Map<String, Object> templateParams = Map.of(
      "translatorName",
      translatorName,
      "langPair",
      langPair,
      "expiryDate",
      formatDate(expiryDate),
      "nextMeetingDate",
      nextMeetingDateOption.map(this::formatDate).orElse("[ei tiedossa]")
    );

    return templateRenderer.renderAuthorisationExpiryEmailBody(templateParams);
  }

  private String formatDate(final LocalDate date) {
    return date.format(DATE_FORMATTER);
  }

  private void createAuthorisationTermReminder(final Authorisation authorisation, final Email email) {
    final AuthorisationTermReminder reminder = new AuthorisationTermReminder();
    reminder.setAuthorisation(authorisation);
    reminder.setEmail(email);

    authorisationTermReminderRepository.save(reminder);
  }
}
