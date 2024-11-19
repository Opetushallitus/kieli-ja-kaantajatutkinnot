package fi.oph.vkt.service;

import static fi.oph.vkt.util.LocalisationUtil.localeFI;
import static fi.oph.vkt.util.LocalisationUtil.localeSV;

import fi.oph.vkt.model.EmailType;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.service.email.EmailAttachmentData;
import fi.oph.vkt.service.email.EmailService;
import fi.oph.vkt.service.receipt.ReceiptRenderer;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import fi.oph.vkt.util.LocalisationUtil;
import fi.oph.vkt.util.TemplateRenderer;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExaminerEnrollmentEmailService extends AbstractEnrollmentEmailService {

  private final EmailService emailService;
  private final Environment environment;
  private final TemplateRenderer templateRenderer;

  @Transactional
  public void sendEnrollmentAppointmentAuthLink(final EnrollmentAppointment enrollment)
    throws IOException, InterruptedException {
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");
    final Map<String, Object> templateParams = getEmailParams(enrollment, enrollment.getExaminerExamEvent());
    final String authUrl = ClerkEnrollmentUtil.getAuthUrl(baseUrlAPI, enrollment.getId(), enrollment.getAuthHash());

    templateParams.put("type", "enrollment");
    templateParams.put("enrollmentAuthLink", authUrl);

    final String recipientName = enrollment.getFirstName() + " " + enrollment.getLastName();
    final String recipientAddress = enrollment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.enrollment-confirmation"),
      LocalisationUtil.translate(localeSV, "subject.enrollment-confirmation")
    );
    final String body = templateRenderer.renderEnrollmentAppointmentAuthLink(templateParams);

    createEmail(
      emailService,
      recipientName,
      recipientAddress,
      subject,
      body,
      List.of(),
      EmailType.ENROLLMENT_APPOINTMENT_AUTH_LINK
    );
  }
}
