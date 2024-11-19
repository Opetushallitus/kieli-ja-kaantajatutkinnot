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
  public void sendEnrollmentAppointmentAuthLink(final EnrollmentAppointment enrollment)
    throws IOException, InterruptedException {
    final Map<String, Object> templateParams = new HashMap<>(Map.of());
    final Examiner examiner = enrollment.getExaminer();

    templateParams.put("type", "enrollment");

    final String recipientName = examiner.getFirstName() + " " + examiner.getLastName();
    final String recipientAddress = examiner.getEmail();
    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.contact-request"),
      LocalisationUtil.translate(localeSV, "subject.contact-request")
    );
    final String body = templateRenderer.renderContactRequest(templateParams);

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
