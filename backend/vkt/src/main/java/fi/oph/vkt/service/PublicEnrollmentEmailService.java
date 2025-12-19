package fi.oph.vkt.service;

import static fi.oph.vkt.util.LocalisationUtil.localeFI;
import static fi.oph.vkt.util.LocalisationUtil.localeSV;

import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.model.EmailType;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentCommon;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.service.email.EmailAttachmentData;
import fi.oph.vkt.service.email.EmailService;
import fi.oph.vkt.service.receipt.ReceiptData;
import fi.oph.vkt.service.receipt.ReceiptRenderer;
import fi.oph.vkt.util.EnrollmentUtil;
import fi.oph.vkt.util.LocalisationUtil;
import fi.oph.vkt.util.TemplateRenderer;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicEnrollmentEmailService extends AbstractEnrollmentEmailService {

  private final EmailService emailService;
  private final Environment environment;
  private final ReceiptRenderer receiptRenderer;
  private final TemplateRenderer templateRenderer;

  @Transactional
  public void sendEnrollmentConfirmationEmail(final Enrollment enrollment) throws IOException, InterruptedException {
    final Person person = enrollment.getPerson();
    final Map<String, Object> templateParams = getEmailParams(enrollment, enrollment.getExamEvent());
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

    createEmail(
      emailService,
      recipientName,
      recipientAddress,
      subject,
      body,
      attachments,
      EmailType.ENROLLMENT_CONFIRMATION
    );
  }

  @Transactional
  public void sendEnrollmentToQueueConfirmationEmail(final Enrollment enrollment, final Person person) {
    final Map<String, Object> templateParams = getEmailParams(enrollment, enrollment.getExamEvent());
    templateParams.put("type", "queue");

    final String recipientName = person.getFirstName() + " " + person.getLastName();
    final String recipientAddress = enrollment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.enrollment-to-queue-confirmation"),
      LocalisationUtil.translate(localeSV, "subject.enrollment-to-queue-confirmation")
    );

    final String body = templateRenderer.renderEnrollmentConfirmationEmailBody(templateParams);

    createEmail(
      emailService,
      recipientName,
      recipientAddress,
      subject,
      body,
      List.of(),
      EmailType.ENROLLMENT_TO_QUEUE_CONFIRMATION
    );
  }

  private EmailAttachmentData createReceiptAttachment(final EnrollmentCommon enrollment, final Locale locale)
    throws IOException, InterruptedException {
    final ReceiptData receiptData = receiptRenderer.getReceiptData(enrollment, locale);
    final byte[] receiptBytes = receiptRenderer.getReceiptPdfBytes(receiptData, locale);

    final String attachmentNamePrefix = LocalisationUtil.translate(locale, "payment.receipt");

    return EmailAttachmentData
      .builder()
      .name(attachmentNamePrefix + " " + receiptData.date() + ".pdf")
      .contentType("application/pdf")
      .data(receiptBytes)
      .build();
  }

  @Transactional
  public void sendFreeEnrollmentConfirmationEmail(
    final Enrollment enrollment,
    final Person person,
    final FreeEnrollmentDetails freeEnrollmentDetails
  ) {
    final Map<String, Object> templateParams = withFreeEmailParams(
      getEmailParams(enrollment, enrollment.getExamEvent()),
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

    createEmail(
      emailService,
      recipientName,
      recipientAddress,
      subject,
      body,
      List.of(),
      EmailType.ENROLLMENT_CONFIRMATION
    );
  }

  @Transactional
  public void sendFreeEnrollmentToQueueConfirmationEmail(
    final Enrollment enrollment,
    final Person person,
    final FreeEnrollmentDetails freeEnrollmentDetails
  ) {
    final Map<String, Object> templateParams = withFreeEmailParams(
      getEmailParams(enrollment, enrollment.getExamEvent()),
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

    createEmail(
      emailService,
      recipientName,
      recipientAddress,
      subject,
      body,
      List.of(),
      EmailType.ENROLLMENT_TO_QUEUE_CONFIRMATION
    );
  }

  @Transactional
  public void sendPartiallyFreeEnrollmentConfirmationEmail(
    final Enrollment enrollment,
    final Person person,
    final FreeEnrollmentDetails freeEnrollmentDetails
  ) throws IOException, InterruptedException {
    final Map<String, Object> templateParams = withFreeEmailParams(
      getEmailParams(enrollment, enrollment.getExamEvent()),
      freeEnrollmentDetails,
      enrollment.getFreeEnrollment().getSource(),
      "enrollment"
    );
    templateParams.put("isFree", "false");

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

    createEmail(
      emailService,
      recipientName,
      recipientAddress,
      subject,
      body,
      attachments,
      EmailType.ENROLLMENT_CONFIRMATION
    );
  }

  @Transactional
  public void sendPartiallyFreeEnrollmentToQueueConfirmationEmail(
    final Enrollment enrollment,
    final Person person,
    final FreeEnrollmentDetails freeEnrollmentDetails
  ) {
    final Map<String, Object> templateParams = withFreeEmailParams(
      getEmailParams(enrollment, enrollment.getExamEvent()),
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

    createEmail(
      emailService,
      recipientName,
      recipientAddress,
      subject,
      body,
      List.of(),
      EmailType.ENROLLMENT_TO_QUEUE_CONFIRMATION
    );
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

  @Transactional
  public void sendEnrollmentAppointmentConfirmationEmail(final EnrollmentAppointment enrollmentAppointment)
    throws IOException, InterruptedException {
    final Map<String, Object> templateParams = getEmailParams(
      enrollmentAppointment,
      enrollmentAppointment.getExaminerExamEvent()
    );
    final ExaminerExamEvent examEvent = enrollmentAppointment.getExaminerExamEvent();
    templateParams.put("examTime", examEvent.getExamTime());
    templateParams.put("examLocation", examEvent.getLocation());
    templateParams.put("otherInformation", examEvent.getOtherInformation());
    final Person person = enrollmentAppointment.getPerson();

    final String recipientName = person.getFirstName() + " " + person.getLastName();
    final String recipientAddress = enrollmentAppointment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.enrollment-appointment-confirmation"),
      LocalisationUtil.translate(localeSV, "subject.enrollment-appointment-confirmation")
    );
    final String body = templateRenderer.renderEnrollmentAppointmentConfirmationEmailBody(templateParams);

    final List<EmailAttachmentData> attachments = environment.getRequiredProperty(
        "app.email.sending-enabled",
        Boolean.class
      )
      ? List.of(
        createReceiptAttachment(enrollmentAppointment, localeFI),
        createReceiptAttachment(enrollmentAppointment, localeSV)
      )
      : List.of(); // for local development

    createEmail(
      emailService,
      recipientName,
      recipientAddress,
      subject,
      body,
      attachments,
      EmailType.ENROLLMENT_APPOINTMENT_CONFIRMATION
    );
  }
}
