package fi.oph.otr.service.email;

import fi.oph.otr.model.Email;
import fi.oph.otr.model.EmailType;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.model.QualificationReminder;
import fi.oph.otr.repository.EmailRepository;
import fi.oph.otr.repository.QualificationReminderRepository;
import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.service.LanguageService;
import fi.oph.otr.util.TemplateRenderer;
import fi.oph.otr.util.localisation.Language;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
  private final QualificationRepository qualificationRepository;

  @Resource
  private final QualificationReminderRepository qualificationReminderRepository;

  @Resource
  private final EmailRepository emailRepository;

  @Resource
  private final EmailService emailService;

  @Resource
  private final LanguageService languageService;

  @Resource
  private final TemplateRenderer templateRenderer;

  @Transactional
  public void createEmail(final long qualificationId) {
    qualificationRepository.findById(qualificationId).ifPresent(this::createQualificationExpiryData);
  }

  private void createQualificationExpiryData(final Qualification qualification) {
    final Interpreter interpreter = qualification.getInterpreter();

    // TODO: get these from OnrService
    final String personalDataEmail = "interpreter" + interpreter.getId() + "@example.invalid";
    final String personalDataName = "Tulkki " + interpreter.getId();

    // TODO: remove Optional.ofNullable + ifPresent if email always exists
    Optional
      .ofNullable(personalDataEmail)
      .ifPresent(recipientAddress -> {
        final String recipientName = personalDataName;

        final String emailSubject = "Merkintäsi oikeustulkkirekisteriin on päättymässä";

        final String emailBody = getQualificationExpiryEmailBody(
          recipientName,
          qualification.getFromLang(),
          qualification.getToLang(),
          qualification.getEndDate()
        );

        final Long emailId = createEmail(
          recipientName,
          recipientAddress,
          emailSubject,
          emailBody,
          EmailType.QUALIFICATION_EXPIRY
        );

        final Email email = emailRepository.getById(emailId);

        createQualificationReminder(qualification, email);
      });
  }

  private String getQualificationExpiryEmailBody(
    final String interpreterName,
    final String fromLangCode,
    final String toLangCode,
    final LocalDate expiryDate
  ) {
    final String langPair =
      languageService.getLocalisationValue(fromLangCode, Language.FI).orElse(fromLangCode) +
      " - " +
      languageService.getLocalisationValue(toLangCode, Language.FI).orElse(toLangCode);

    final Map<String, Object> templateParams = Map.of(
      "interpreterName",
      interpreterName,
      "langPair",
      langPair,
      "expiryDate",
      expiryDate.format(DATE_FORMATTER)
    );

    return templateRenderer.renderQualificationExpiryEmailBody(templateParams);
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

  private void createQualificationReminder(final Qualification qualification, final Email email) {
    final QualificationReminder reminder = new QualificationReminder();
    reminder.setQualification(qualification);
    reminder.setEmail(email);

    qualificationReminderRepository.save(reminder);
  }
}
