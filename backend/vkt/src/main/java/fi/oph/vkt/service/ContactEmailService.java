package fi.oph.vkt.service;

import static fi.oph.vkt.util.LocalisationUtil.localeFI;
import static fi.oph.vkt.util.LocalisationUtil.localeSV;

import fi.oph.vkt.model.EmailType;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.service.email.EmailService;
import fi.oph.vkt.util.LocalisationUtil;
import fi.oph.vkt.util.TemplateRenderer;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactEmailService extends AbstractEnrollmentEmailService {

  private final EmailService emailService;
  private final TemplateRenderer templateRenderer;

  @Transactional
  public void sendReceiptNotificationForContactRequest(final EnrollmentAppointment enrollment)
    throws IOException, InterruptedException {
    final Map<String, Object> templateParams = new HashMap<>(Map.of());
    final Examiner examiner = enrollment.getExaminer();
    final String examinerName = examiner.getFirstName() + " " + examiner.getLastName();
    templateParams.put("examinerName", examinerName);
    templateParams.put("message", enrollment.getMessage());
    final String recipientName = enrollment.getFirstName() + " " + enrollment.getLastName();
    final String recipientAddress = enrollment.getEmail();
    templateParams.put("name", recipientName);
    templateParams.put("email", recipientAddress);

    // TODO Translate to Swedish
    final String subject = String.format(
      "%s",
      LocalisationUtil.translate(localeFI, "subject.contact-request.receipt-notification")
    );
    final String body = templateRenderer.renderContactRequestReceiptNotification(templateParams);
    createEmail(
      emailService,
      recipientName,
      recipientAddress,
      subject,
      body,
      List.of(),
      EmailType.ENROLLMENT_CONTACT_REQUEST
    );
  }

  @Transactional
  public void sendExaminerNotificationOfContactRequest(final EnrollmentAppointment enrollment)
    throws IOException, InterruptedException {
    final Map<String, Object> templateParams = new HashMap<>(Map.of());
    final Examiner examiner = enrollment.getExaminer();

    templateParams.put("type", "enrollment");

    final String recipientName = examiner.getFirstName() + " " + examiner.getLastName();
    final String recipientAddress = examiner.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.contact-request.notice-for-examiner"),
      LocalisationUtil.translate(localeSV, "subject.contact-request.notice-for-examiner")
    );
    final String body = templateRenderer.renderContactRequestNoticeForExaminer(templateParams);

    createEmail(
      emailService,
      recipientName,
      recipientAddress,
      subject,
      body,
      List.of(),
      EmailType.ENROLLMENT_CONTACT_REQUEST
    );
  }
}
