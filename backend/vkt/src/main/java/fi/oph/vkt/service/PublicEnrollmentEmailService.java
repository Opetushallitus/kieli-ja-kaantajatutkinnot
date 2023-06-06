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
    final String subject =
      "Vahvistus ilmoittautumisesta Valtionhallinnon kielitutkintoon (VKT) | Bekräftelse av anmälan till Språkexamen för statsförvaltningen (VKT)";
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
    final String subject =
      "Vahvistus ilmoittautumisesta jonotuspaikalle Valtionhallinnon kielitutkintoon (VKT) | Bekräftelse av plats i kön för Språkexamen för statsförvaltningen (VKT)";
    final String body = templateRenderer.renderEnrollmentToQueueConfirmationEmailBody(templateParams);

    createEmail(recipientName, recipientAddress, subject, body, List.of(), EmailType.ENROLLMENT_TO_QUEUE_CONFIRMATION);
  }

  private Map<String, Object> getEmailParams(final Enrollment enrollment) {
    final ExamEvent examEvent = enrollment.getExamEvent();

    final Map<String, Object> params = new HashMap<>(Map.of());

    if (examEvent.getLanguage() == ExamLanguage.FI) {
      params.put("examLanguageFI", "suomi");
      params.put("examLanguageSV", "finska");
    } else {
      params.put("examLanguageFI", "ruotsi");
      params.put("examLanguageSV", "svenska");
    }

    params.put("examLevelFI", "erinomainen taito");
    params.put("examLevelSV", "utmärkta språkkunskaper");

    params.put("examDate", examEvent.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));

    params.put(
      "skillsFI",
      joinNonEmptyStrings(
        Stream.of(
          enrollment.isTextualSkill() ? "kirjallinen taito" : "",
          enrollment.isOralSkill() ? "suullinen taito" : "",
          enrollment.isUnderstandingSkill() ? "ymmärtämisen taito" : ""
        )
      )
    );

    final String examLanguageSV = (String) params.get("examLanguageSV");
    params.put(
      "skillsSV",
      joinNonEmptyStrings(
        Stream.of(
          enrollment.isTextualSkill() ? "förmåga att använda " + examLanguageSV + " i skrift" : "",
          enrollment.isOralSkill() ? "förmåga att använda " + examLanguageSV + " i tal" : "",
          enrollment.isUnderstandingSkill() ? "förmåga att förstå " + examLanguageSV : ""
        )
      )
    );

    params.put(
      "partialExamsFI",
      joinNonEmptyStrings(
        Stream.of(
          enrollment.isWritingPartialExam() ? "kirjoittaminen" : "",
          enrollment.isReadingComprehensionPartialExam() ? "tekstin ymmärtäminen" : "",
          enrollment.isSpeakingPartialExam() ? "puhuminen" : "",
          enrollment.isSpeechComprehensionPartialExam() ? "puheen ymmärtäminen" : ""
        )
      )
    );
    params.put(
      "partialExamsSV",
      joinNonEmptyStrings(
        Stream.of(
          enrollment.isWritingPartialExam() ? "skriftlig färdighet" : "",
          enrollment.isReadingComprehensionPartialExam() ? "textförståelse" : "",
          enrollment.isSpeakingPartialExam() ? "muntlig färdighet" : "",
          enrollment.isSpeechComprehensionPartialExam() ? "hörförståelse" : ""
        )
      )
    );

    return params;
  }

  private String joinNonEmptyStrings(final Stream<String> stream) {
    return stream.filter(s -> !s.isEmpty()).collect(Collectors.joining(", "));
  }

  private EmailAttachmentData createReceiptAttachment(final Enrollment enrollment, final Language language)
    throws IOException, InterruptedException {
    final ReceiptData receiptData = receiptRenderer.getReceiptData(enrollment.getId(), language);
    final byte[] receiptBytes = receiptRenderer.getReceiptPdfBytes(language, receiptData);

    final String attachmentNamePrefix = language == Language.FI ? "Maksukuitti" : "Betalningkvitto";

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
