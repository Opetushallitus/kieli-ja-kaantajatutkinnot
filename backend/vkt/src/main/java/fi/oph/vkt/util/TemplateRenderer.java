package fi.oph.vkt.util;

import fi.oph.vkt.util.localisation.Language;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class TemplateRenderer {

  private final TemplateEngine templateEngine;

  public String renderEnrollmentConfirmationEmailBody(final Map<String, Object> params) {
    return renderTemplate("enrollment-confirmation", params);
  }

  public String renderEnrollmentToQueueConfirmationEmailBody(final Map<String, Object> params) {
    return renderTemplate("enrollment-to-queue-confirmation", params);
  }

  public String renderReceipt(final Language language, final Map<String, Object> params) {
    return switch (language) {
      case FI -> renderTemplate("receipt_fi-FI", params);
      case SV -> renderTemplate("receipt_sv-SE", params);
    };
  }

  private String renderTemplate(final String template, final Map<String, Object> params) {
    final Context context = new Context();
    context.setVariables(params);

    return templateEngine.process(template, context);
  }
}
