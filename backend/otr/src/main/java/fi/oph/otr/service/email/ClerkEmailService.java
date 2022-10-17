package fi.oph.otr.service.email;

import fi.oph.otr.model.Email;
import fi.oph.otr.model.EmailType;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.model.QualificationReminder;
import fi.oph.otr.onr.OnrService;
import fi.oph.otr.onr.model.PersonalData;
import fi.oph.otr.repository.EmailRepository;
import fi.oph.otr.repository.QualificationReminderRepository;
import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.service.LanguageService;
import fi.oph.otr.util.TemplateRenderer;
import fi.oph.otr.util.localisation.Language;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import javax.annotation.Resource;
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
  private final OnrService onrService;

  @Resource
  private final TemplateRenderer templateRenderer;

  @Transactional
  public void createQualificationExpiryEmail(final long qualificationId) {
    qualificationRepository.findById(qualificationId).ifPresent(this::createQualificationExpiryData);
  }

  private void createQualificationExpiryData(final Qualification qualification) {
    final Interpreter interpreter = qualification.getInterpreter();
    final PersonalData personalData = onrService.getCachedPersonalDatas().get(interpreter.getOnrId());

    if (personalData != null) {
      final String recipientName = personalData.getNickName() + " " + personalData.getLastName();
      final String recipientAddress = personalData.getEmail();
      final String emailSubject = "Merkintäsi oikeustulkkirekisteriin on päättymässä";

      if (recipientAddress == null) {
        LOG.info("Email for interpreter with onr id {} doesn't exist", interpreter.getOnrId());
        return;
      }

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

      final Email email = emailRepository.getReferenceById(emailId);

      createQualificationReminder(qualification, email);
    } else {
      LOG.warn("Personal data by onr id {} not found", interpreter.getOnrId());
    }
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
