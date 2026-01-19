package fi.oph.vkt.service;

import static fi.oph.vkt.util.LocalisationUtil.localeFI;
import static fi.oph.vkt.util.LocalisationUtil.localeSV;

import fi.oph.vkt.model.EmailType;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.service.email.EmailService;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import fi.oph.vkt.util.LocalisationUtil;
import fi.oph.vkt.util.TemplateRenderer;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExaminerEnrollmentEmailService extends AbstractEnrollmentEmailService {

  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

  private final EmailService emailService;
  private final Environment environment;
  private final TemplateRenderer templateRenderer;

  @Transactional
  public void sendEnrollmentAppointmentAuthLink(final EnrollmentAppointment enrollment) {
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");
    final Map<String, Object> templateParams = getEmailParams(enrollment, enrollment.getExaminerExamEvent());

    final String authUrl = ClerkEnrollmentUtil.getAuthUrl(baseUrlAPI, enrollment.getId(), enrollment.getAuthHash());
    templateParams.put("enrollmentAuthLink", authUrl);

    final Examiner examiner = enrollment.getExaminer();
    final String examinerName = examiner.getNickname() + " " + examiner.getLastName();
    templateParams.put("examinerName", examinerName);

    final ExaminerExamEvent examEvent = enrollment.getExaminerExamEvent();
    templateParams.put("examLocation", examEvent.getLocation());

    final String expiresAt = enrollment.getExpiresAt() != null ? DATE_FORMAT.format(enrollment.getExpiresAt()) : "-";
    templateParams.put("expiresAt", expiresAt);

    final String recipientName = enrollment.getFirstName() + " " + enrollment.getLastName();
    final String recipientAddress = enrollment.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.enrollment-appointment-authentication"),
      LocalisationUtil.translate(localeSV, "subject.enrollment-appointment-authentication")
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
