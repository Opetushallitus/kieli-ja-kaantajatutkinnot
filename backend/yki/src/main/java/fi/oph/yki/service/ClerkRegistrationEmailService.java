package fi.oph.yki.service;

import static fi.oph.yki.util.LocalisationUtil.localeFI;
import static fi.oph.yki.util.LocalisationUtil.localeSV;

import fi.oph.yki.model.EmailType;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.service.email.EmailData;
import fi.oph.yki.service.email.EmailService;
import fi.oph.yki.util.LocalisationUtil;
import fi.oph.yki.util.TemplateRenderer;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkRegistrationEmailService {

  private final EmailService emailService;
  private final TemplateRenderer templateRenderer;

  @Transactional
  public void sendSupplementRequestEmail(final FreeRegistration freeRegistration) {
    final Registration registration = freeRegistration.getRegistration();
    final Person person = registration.getPerson();
    final String recipientName = person.getFirstName() + " " + person.getLastName();
    final String recipientAddress = person.getEmail();
    final Map<String, Object> templateParams = Map.of("type", "enrollment");

    final String subject = String.format(
      "%s | %s",
      LocalisationUtil.translate(localeFI, "subject.supplement-request"),
      LocalisationUtil.translate(localeSV, "subject.supplement-request")
    );

    final String body = templateRenderer.renderEnrollmentConfirmationEmailBody(templateParams);

    createEmail(
      emailService,
      recipientName,
      recipientAddress,
      subject,
      body,
      EmailType.REGISTRATION_SUPPLEMENT_REQUEST
    );
  }

  private void createEmail(
    final EmailService emailService,
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

    emailService.saveEmail(emailType, emailData);
  }
}
