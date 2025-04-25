package fi.oph.vkt.util;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class TemplateRenderer {

  private final TemplateEngine templateEngine;

  public String renderEnrollmentConfirmationEmailBody(final Map<String, Object> params) {
    return renderTemplate("enrollment-confirmation", params, Optional.empty());
  }

  public String renderEnrollmentAppointmentAuthLink(final Map<String, Object> params) {
    return renderTemplate("enrollment-appointment-auth-link", params, Optional.empty());
  }

  public String renderEnrollmentAppointmentConfirmationEmailBody(final Map<String, Object> params) {
    return renderTemplate("enrollment-appointment-confirmation", params, Optional.empty());
  }

  public String renderContactRequestReceiptNotification(final Map<String, Object> params) {
    return renderTemplate("contact-request-receipt-notification.html", params, Optional.empty());
  }

  public String renderContactRequestNoticeForExaminer(final Map<String, Object> params) {
    return renderTemplate("examiner-contact-request.html", params, Optional.empty());
  }

  public String renderReceipt(final Locale locale, final Map<String, Object> params) {
    return renderTemplate("receipt", params, Optional.of(locale));
  }

  private String renderTemplate(
    final String template,
    final Map<String, Object> params,
    final Optional<Locale> optionalLocale
  ) {
    final Context context = new Context();
    context.setVariables(params);
    optionalLocale.ifPresent(context::setLocale);

    return templateEngine.process(template, context);
  }
}
