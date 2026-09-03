package fi.oph.yki.util;

import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class TemplateRenderer {

  private final TemplateEngine templateEngine;

  public String render(final String templateName, final Map<String, Object> params, final Locale locale) {
    final Context context = new Context();
    context.setVariables(params);
    context.setLocale(locale);

    return templateEngine.process(templateName, context);
  }
}
