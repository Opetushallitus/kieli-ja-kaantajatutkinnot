package fi.oph.akt.util;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class TemplateRenderer {

  private final TemplateEngine templateEngine;

  public String renderAuthorisationExpiryEmailBody(final Map<String, Object> params) {
    return renderTemplate("authorisation-expiry", params);
  }

  public String renderContactRequestClerkEmailBody(final Map<String, Object> params) {
    return renderTemplate("contact-request-clerk", params);
  }

  public String renderContactRequestRequesterEmailBody(final Map<String, Object> params) {
    return renderTemplate("contact-request-requester", params);
  }

  public String renderContactRequestTranslatorEmailBody(final Map<String, Object> params) {
    return renderTemplate("contact-request-translator", params);
  }

  private String renderTemplate(final String template, final Map<String, Object> params) {
    final Context context = new Context();
    context.setVariables(params);

    return templateEngine.process(template, context);
  }
}
