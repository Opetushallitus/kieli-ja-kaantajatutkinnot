package fi.oph.vkt.service;

import fi.oph.vkt.model.EmailType;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.service.email.EmailAttachmentData;
import fi.oph.vkt.service.email.EmailData;
import fi.oph.vkt.service.email.EmailService;
import fi.oph.vkt.service.receipt.ReceiptData;
import fi.oph.vkt.service.receipt.ReceiptRenderer;
import fi.oph.vkt.util.TemplateRenderer;
import fi.oph.vkt.util.localisation.Language;
import fi.oph.vkt.util.localisation.LocalisationUtil;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicEnrollmentEmailService {

  private final EmailService emailService;
  private final Environment environment;
  private final ReceiptRenderer receiptRenderer;
  private final TemplateRenderer templateRenderer;

  @Transactional
  public void sendEnrollmentConfirmationEmail(final Enrollment enrollment) throws IOException, InterruptedException {
    final Person person = enrollment.getPerson();
    final Map<String, Object> templateParams = getEmailParams(enrollment);

    final String recipientName = person.getFirstName() + " " + person.getLastName();
    final String recipientAddress = enrollment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(Language.FI, "subject.enrollment-confirmation"),
      LocalisationUtil.translate(Language.SV, "subject.enrollment-confirmation")
    );
    final String body = templateRenderer.renderEnrollmentConfirmationEmailBody(templateParams);

    final List<EmailAttachmentData> attachments = environment.getRequiredProperty(
        "app.email.sending-enabled",
        Boolean.class
      )
      ? List.of(createReceiptAttachment(enrollment, Language.FI), createReceiptAttachment(enrollment, Language.SV))
      : List.of(); // for local development

    createEmail(recipientName, recipientAddress, subject, body, attachments, EmailType.ENROLLMENT_CONFIRMATION);
  }

  @Transactional
  public void sendEnrollmentToQueueConfirmationEmail(final Enrollment enrollment, final Person person) {
    final Map<String, Object> templateParams = getEmailParams(enrollment);

    final String recipientName = person.getFirstName() + " " + person.getLastName();
    final String recipientAddress = enrollment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(Language.FI, "subject.enrollment-to-queue-confirmation"),
      LocalisationUtil.translate(Language.SV, "subject.enrollment-to-queue-confirmation")
    );
    final String body = templateRenderer.renderEnrollmentToQueueConfirmationEmailBody(templateParams);

    createEmail(recipientName, recipientAddress, subject, body, List.of(), EmailType.ENROLLMENT_TO_QUEUE_CONFIRMATION);
  }

  private Map<String, Object> getEmailParams(final Enrollment enrollment) {
    final ExamEvent examEvent = enrollment.getExamEvent();

    final Map<String, Object> params = new HashMap<>(Map.of());

    if (examEvent.getLanguage() == ExamLanguage.FI) {
      params.put("examLanguageFI", LocalisationUtil.translate(Language.FI, "lang.finnish"));
      params.put("examLanguageSV", LocalisationUtil.translate(Language.SV, "lang.finnish"));
    } else {
      params.put("examLanguageFI", LocalisationUtil.translate(Language.FI, "lang.swedish"));
      params.put("examLanguageSV", LocalisationUtil.translate(Language.SV, "lang.swedish"));
    }

    params.put("examLevelFI", LocalisationUtil.translate(Language.FI, "examLevel.excellent"));
    params.put("examLevelSV", LocalisationUtil.translate(Language.SV, "examLevel.excellent"));

    params.put("examDate", examEvent.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));

    params.put("skillsFI", getEmailParamSkills(enrollment, Language.FI, params.get("examLanguageFI")));
    params.put("skillsSV", getEmailParamSkills(enrollment, Language.SV, params.get("examLanguageSV")));

    params.put("partialExamsFI", getEmailParamPartialExams(enrollment, Language.FI));
    params.put("partialExamsSV", getEmailParamPartialExams(enrollment, Language.SV));

    return params;
  }

  private String getEmailParamSkills(final Enrollment enrollment, final Language language, final Object... args) {
    return joinNonEmptyStrings(
      Stream.of(
        enrollment.isTextualSkill() ? LocalisationUtil.translate(language, "skill.textual", args) : "",
        enrollment.isOralSkill() ? LocalisationUtil.translate(language, "skill.oral", args) : "",
        enrollment.isUnderstandingSkill() ? LocalisationUtil.translate(language, "skill.understanding", args) : ""
      )
    );
  }

  private String getEmailParamPartialExams(final Enrollment enrollment, final Language language) {
    return joinNonEmptyStrings(
      Stream.of(
        enrollment.isWritingPartialExam() ? LocalisationUtil.translate(language, "partialExam.writing") : "",
        enrollment.isReadingComprehensionPartialExam()
          ? LocalisationUtil.translate(language, "partialExam.readingComprehension")
          : "",
        enrollment.isSpeakingPartialExam() ? LocalisationUtil.translate(language, "partialExam.speaking") : "",
        enrollment.isSpeechComprehensionPartialExam()
          ? LocalisationUtil.translate(language, "partialExam.speechComprehension")
          : ""
      )
    );
  }

  private String joinNonEmptyStrings(final Stream<String> stream) {
    return stream.filter(s -> !s.isEmpty()).collect(Collectors.joining(", "));
  }

  private EmailAttachmentData createReceiptAttachment(final Enrollment enrollment, final Language language)
    throws IOException, InterruptedException {
    final ReceiptData receiptData = receiptRenderer.getReceiptData(enrollment.getId(), language);
    final byte[] receiptBytes = receiptRenderer.getReceiptPdfBytes(receiptData, language);

    final String attachmentNamePrefix = LocalisationUtil.translate(language, "paymentReceipt");

    return EmailAttachmentData
      .builder()
      .name(attachmentNamePrefix + " " + receiptData.date() + ".pdf")
      .contentType("application/pdf")
      .data(receiptBytes)
      .build();
  }

  private void createEmail(
    final String recipientName,
    final String recipientAddress,
    final String subject,
    final String body,
    final List<EmailAttachmentData> attachments,
    final EmailType emailType
  ) {
    final EmailData emailData = EmailData
      .builder()
      .recipientName(recipientName)
      .recipientAddress(recipientAddress)
      .subject(subject)
      .body(body)
      .attachments(attachments)
      .build();

    emailService.saveEmail(emailType, emailData);
  }
}
