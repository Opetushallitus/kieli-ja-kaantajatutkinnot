package fi.oph.yki.util;

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
