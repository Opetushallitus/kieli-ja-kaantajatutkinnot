package fi.oph.vkt.service;

import static fi.oph.vkt.util.LocalisationUtil.localeFI;
import static fi.oph.vkt.util.LocalisationUtil.localeSV;

import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.model.EmailType;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.service.email.EmailAttachmentData;
import fi.oph.vkt.service.email.EmailData;
import fi.oph.vkt.service.email.EmailService;
import fi.oph.vkt.service.receipt.ReceiptData;
import fi.oph.vkt.service.receipt.ReceiptRenderer;
import fi.oph.vkt.util.EnrollmentUtil;
import fi.oph.vkt.util.LocalisationUtil;
import fi.oph.vkt.util.TemplateRenderer;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
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
    templateParams.put("type", "enrollment");

    final String recipientName = person.getFirstName() + " " + person.getLastName();
    final String recipientAddress = enrollment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.enrollment-confirmation"),
      LocalisationUtil.translate(localeSV, "subject.enrollment-confirmation")
    );
    final String body = templateRenderer.renderEnrollmentConfirmationEmailBody(templateParams);

    final List<EmailAttachmentData> attachments = environment.getRequiredProperty(
        "app.email.sending-enabled",
        Boolean.class
      )
      ? List.of(createReceiptAttachment(enrollment, localeFI), createReceiptAttachment(enrollment, localeSV))
      : List.of(); // for local development

    createEmail(recipientName, recipientAddress, subject, body, attachments, EmailType.ENROLLMENT_CONFIRMATION);
  }

  @Transactional
  public void sendEnrollmentToQueueConfirmationEmail(final Enrollment enrollment, final Person person) {
    final Map<String, Object> templateParams = getEmailParams(enrollment);
    templateParams.put("type", "queue");

    final String recipientName = person.getFirstName() + " " + person.getLastName();
    final String recipientAddress = enrollment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.enrollment-to-queue-confirmation"),
      LocalisationUtil.translate(localeSV, "subject.enrollment-to-queue-confirmation")
    );

    final String body = templateRenderer.renderEnrollmentConfirmationEmailBody(templateParams);

    createEmail(recipientName, recipientAddress, subject, body, List.of(), EmailType.ENROLLMENT_TO_QUEUE_CONFIRMATION);
  }

  private Map<String, Object> getEmailParams(final Enrollment enrollment) {
    final ExamEvent examEvent = enrollment.getExamEvent();

    final Map<String, Object> params = new HashMap<>(Map.of());

    if (examEvent.getLanguage() == ExamLanguage.FI) {
      params.put("examLanguageFI", LocalisationUtil.translate(LocalisationUtil.localeFI, "lang.finnish"));
      params.put("examLanguageSV", LocalisationUtil.translate(LocalisationUtil.localeSV, "lang.finnish"));
    } else {
      params.put("examLanguageFI", LocalisationUtil.translate(LocalisationUtil.localeFI, "lang.swedish"));
      params.put("examLanguageSV", LocalisationUtil.translate(LocalisationUtil.localeSV, "lang.swedish"));
    }

    params.put("examLevelFI", LocalisationUtil.translate(localeFI, "examLevel.excellent"));
    params.put("examLevelSV", LocalisationUtil.translate(localeSV, "examLevel.excellent"));

    params.put("examDate", examEvent.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));

    params.put("skillsFI", getEmailParamSkills(enrollment, localeFI, params.get("examLanguageFI")));
    params.put("skillsSV", getEmailParamSkills(enrollment, localeSV, params.get("examLanguageSV")));

    params.put("partialExamsFI", getEmailParamPartialExams(enrollment, localeFI));
    params.put("partialExamsSV", getEmailParamPartialExams(enrollment, localeSV));

    params.put("type", "enrollment");
    params.put("isFree", false);

    return params;
  }

  private String getEmailParamSkills(final Enrollment enrollment, final Locale locale, final Object... args) {
    return joinNonEmptyStrings(
      Stream.of(
        enrollment.isTextualSkill() ? LocalisationUtil.translate(locale, "skill.textual", args) : "",
        enrollment.isOralSkill() ? LocalisationUtil.translate(locale, "skill.oral", args) : "",
        enrollment.isUnderstandingSkill() ? LocalisationUtil.translate(locale, "skill.understanding", args) : ""
      )
    );
  }

  private String getEmailParamPartialExams(final Enrollment enrollment, final Locale locale) {
    return joinNonEmptyStrings(
      Stream.of(
        enrollment.isWritingPartialExam() ? LocalisationUtil.translate(locale, "partialExam.writing") : "",
        enrollment.isReadingComprehensionPartialExam()
          ? LocalisationUtil.translate(locale, "partialExam.readingComprehension")
          : "",
        enrollment.isSpeakingPartialExam() ? LocalisationUtil.translate(locale, "partialExam.speaking") : "",
        enrollment.isSpeechComprehensionPartialExam()
          ? LocalisationUtil.translate(locale, "partialExam.speechComprehension")
          : ""
      )
    );
  }

  private String joinNonEmptyStrings(final Stream<String> stream) {
    return stream.filter(s -> !s.isEmpty()).collect(Collectors.joining(", "));
  }

  private EmailAttachmentData createReceiptAttachment(final Enrollment enrollment, final Locale locale)
    throws IOException, InterruptedException {
    final ReceiptData receiptData = receiptRenderer.getReceiptData(enrollment.getId(), locale);
    final byte[] receiptBytes = receiptRenderer.getReceiptPdfBytes(receiptData, locale);

    final String attachmentNamePrefix = LocalisationUtil.translate(locale, "payment.receipt");

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

  @Transactional
  public void sendFreeEnrollmentConfirmationEmail(
    final Enrollment enrollment,
    final Person person,
    final FreeEnrollmentDetails freeEnrollmentDetails
  ) {
    final Map<String, Object> templateParams = withFreeEmailParams(
      getEmailParams(enrollment),
      freeEnrollmentDetails,
      enrollment.getFreeEnrollment().getSource(),
      "enrollment"
    );

    final String recipientName = person.getFirstName() + " " + person.getLastName();
    final String recipientAddress = enrollment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.enrollment-confirmation"),
      LocalisationUtil.translate(localeSV, "subject.enrollment-confirmation")
    );
    final String body = templateRenderer.renderEnrollmentConfirmationEmailBody(templateParams);

    createEmail(recipientName, recipientAddress, subject, body, List.of(), EmailType.ENROLLMENT_CONFIRMATION);
  }

  @Transactional
  public void sendFreeEnrollmentToQueueConfirmationEmail(
    final Enrollment enrollment,
    final Person person,
    final FreeEnrollmentDetails freeEnrollmentDetails
  ) {
    final Map<String, Object> templateParams = withFreeEmailParams(
      getEmailParams(enrollment),
      freeEnrollmentDetails,
      enrollment.getFreeEnrollment().getSource(),
      "queue"
    );

    final String recipientName = person.getFirstName() + " " + person.getLastName();
    final String recipientAddress = enrollment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.enrollment-to-queue-confirmation"),
      LocalisationUtil.translate(localeSV, "subject.enrollment-to-queue-confirmation")
    );
    final String body = templateRenderer.renderEnrollmentConfirmationEmailBody(templateParams);

    createEmail(recipientName, recipientAddress, subject, body, List.of(), EmailType.ENROLLMENT_TO_QUEUE_CONFIRMATION);
  }

  @Transactional
  public void sendPartiallyFreeEnrollmentConfirmationEmail(
    final Enrollment enrollment,
    final Person person,
    final FreeEnrollmentDetails freeEnrollmentDetails
  ) throws IOException, InterruptedException {
    final Map<String, Object> templateParams = withFreeEmailParams(
      getEmailParams(enrollment),
      freeEnrollmentDetails,
      enrollment.getFreeEnrollment().getSource(),
      "enrollment"
    );
    templateParams.put("isFree", "false");

    final String recipientName = person.getFirstName() + " " + person.getLastName();
    final String recipientAddress = enrollment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.enrollment-to-queue-confirmation"),
      LocalisationUtil.translate(localeSV, "subject.enrollment-to-queue-confirmation")
    );
    final String body = templateRenderer.renderEnrollmentConfirmationEmailBody(templateParams);

    final List<EmailAttachmentData> attachments = environment.getRequiredProperty(
        "app.email.sending-enabled",
        Boolean.class
      )
      ? List.of(createReceiptAttachment(enrollment, localeFI), createReceiptAttachment(enrollment, localeSV))
      : List.of(); // for local development

    createEmail(recipientName, recipientAddress, subject, body, attachments, EmailType.ENROLLMENT_CONFIRMATION);
  }

  @Transactional
  public void sendPartiallyFreeEnrollmentToQueueConfirmationEmail(
    final Enrollment enrollment,
    final Person person,
    final FreeEnrollmentDetails freeEnrollmentDetails
  ) {
    final Map<String, Object> templateParams = withFreeEmailParams(
      getEmailParams(enrollment),
      freeEnrollmentDetails,
      enrollment.getFreeEnrollment().getSource(),
      "queue"
    );
    templateParams.put("isFree", "false");

    final String recipientName = person.getFirstName() + " " + person.getLastName();
    final String recipientAddress = enrollment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.enrollment-to-queue-confirmation"),
      LocalisationUtil.translate(localeSV, "subject.enrollment-to-queue-confirmation")
    );
    final String body = templateRenderer.renderEnrollmentConfirmationEmailBody(templateParams);

    createEmail(recipientName, recipientAddress, subject, body, List.of(), EmailType.ENROLLMENT_TO_QUEUE_CONFIRMATION);
  }

  public Map<String, Object> withFreeEmailParams(
    Map<String, Object> params,
    FreeEnrollmentDetails details,
    FreeEnrollmentSource source,
    String type
  ) {
    Map<String, Object> freeParams = new HashMap<>(params);
    freeParams.put("isFree", true);
    freeParams.put("type", type);
    freeParams.put("source", source.name());
    freeParams.put(
      "freeExamsLeftFI",
      String.format(
        "%s: %s/3. %s: %s/3",
        LocalisationUtil.translate(localeFI, "skill.mail.textual"),
        EnrollmentUtil.getFreeExamsLeft(details.textualSkillCount()),
        LocalisationUtil.translate(localeFI, "skill.mail.oral"),
        EnrollmentUtil.getFreeExamsLeft(details.oralSkillCount())
      )
    );
    freeParams.put(
      "freeExamsLeftSV",
      String.format(
        "%s: %s/3. %s: %s/3",
        LocalisationUtil.translate(localeSV, "skill.mail.textual"),
        EnrollmentUtil.getFreeExamsLeft(details.textualSkillCount()),
        LocalisationUtil.translate(localeSV, "skill.mail.oral"),
        EnrollmentUtil.getFreeExamsLeft(details.oralSkillCount())
      )
    );

    return freeParams;
  }
}
