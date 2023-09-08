package fi.oph.akr.service.email;

import fi.oph.akr.api.dto.clerk.InformalEmailRequestDTO;
import fi.oph.akr.model.Authorisation;
import fi.oph.akr.model.AuthorisationTermReminder;
import fi.oph.akr.model.Email;
import fi.oph.akr.model.EmailType;
import fi.oph.akr.model.MeetingDate;
import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.OnrService;
import fi.oph.akr.onr.model.PersonalData;
import fi.oph.akr.repository.AuthorisationRepository;
import fi.oph.akr.repository.AuthorisationTermReminderRepository;
import fi.oph.akr.repository.EmailRepository;
import fi.oph.akr.repository.MeetingDateRepository;
import fi.oph.akr.repository.TranslatorRepository;
import fi.oph.akr.service.LanguagePairService;
import fi.oph.akr.util.TemplateRenderer;
import fi.oph.akr.util.localisation.Language;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkEmailService {

  private static final Logger LOG = LoggerFactory.getLogger(ClerkEmailService.class);

  private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");

  private final AuthorisationRepository authorisationRepository;
  private final AuthorisationTermReminderRepository authorisationTermReminderRepository;
  private final EmailRepository emailRepository;
  private final EmailService emailService;
  private final LanguagePairService languagePairService;
  private final MeetingDateRepository meetingDateRepository;
  private final TemplateRenderer templateRenderer;
  private final TranslatorRepository translatorRepository;
  private final OnrService onrService;

  @Transactional
  public void createInformalEmails(final InformalEmailRequestDTO emailRequestDTO) {
    final List<Long> distinctTranslatorIds = emailRequestDTO.translatorIds().stream().distinct().toList();
    final List<Translator> translators = translatorRepository.findAllById(distinctTranslatorIds);
    final Map<String, PersonalData> personalDatas = onrService.getCachedPersonalDatas();

    if (translators.size() != distinctTranslatorIds.size()) {
      throw new IllegalArgumentException("Each translator by provided translatorIds not found");
    }

    translators.forEach(translator -> {
      final PersonalData personalData = personalDatas.get(translator.getOnrId());

      if (personalData != null) {
        final String recipientName = personalData.getFirstName() + " " + personalData.getLastName();
        final String recipientAddress = personalData.getEmail();
        final String emailSubject = emailRequestDTO.subject();
        final String emailBody = getInformalEmailBody(emailRequestDTO.body());

        if (recipientAddress == null) {
          LOG.info("Email for translator with onr id {} doesn't exist", translator.getOnrId());
          return;
        }

        createEmail(recipientName, recipientAddress, emailSubject, emailBody, EmailType.INFORMAL);
      } else {
        LOG.warn("Personal data by onr id {} not found", translator.getOnrId());
      }
    });
  }

  private String getInformalEmailBody(final String message) {
    final String[] messageLines = message.split("\r?\n");
    final Map<String, Object> params = Map.of("messageLines", messageLines);
    return templateRenderer.renderClerkInformalEmailBody(params);
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
    final PersonalData personalData = onrService.getCachedPersonalDatas().get(translator.getOnrId());

    if (personalData != null) {
      final String recipientName = personalData.getFirstName() + " " + personalData.getLastName();
      final String recipientAddress = personalData.getEmail();
      final String emailSubject = "Auktorisointisi on päättymässä | Din auktorisering går mot sitt slut";

      if (recipientAddress == null) {
        LOG.info("Email for translator with onr id {} doesn't exist", translator.getOnrId());
        return;
      }

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

      final Email email = emailRepository.getReferenceById(emailId);

      createAuthorisationTermReminder(authorisation, email);
    } else {
      LOG.warn("Personal data by onr id {} not found", translator.getOnrId());
    }
  }

  private String getAuthorisationExpiryEmailBody(
    final String translatorName,
    final String fromLangCode,
    final String toLangCode,
    final LocalDate expiryDate
  ) {
    final String langPairFI = languagePairService.getLanguagePairLocalisation(fromLangCode, toLangCode, Language.FI);
    final String langPairSV = languagePairService.getLanguagePairLocalisation(fromLangCode, toLangCode, Language.SV);

    final List<LocalDate> upcomingDates = meetingDateRepository
      .findAllByOrderByDateAsc()
      .stream()
      .map(MeetingDate::getDate)
      .filter(date -> date.isAfter(LocalDate.now()))
      .toList();

    final Map<String, Object> templateParams = Map.of(
      "translatorName",
      translatorName,
      "langPairFI",
      langPairFI,
      "langPairSV",
      langPairSV,
      "expiryDate",
      formatDate(expiryDate),
      "meetingDate1",
      upcomingDates.size() >= 1 ? formatDate(upcomingDates.get(0)) : "-",
      "meetingDate2",
      upcomingDates.size() >= 2 ? formatDate(upcomingDates.get(1)) : "-"
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
