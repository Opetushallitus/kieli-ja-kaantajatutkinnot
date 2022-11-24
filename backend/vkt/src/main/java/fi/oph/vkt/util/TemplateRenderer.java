package fi.oph.vkt.util;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class TemplateRenderer {

  private final TemplateEngine templateEngine;

  public String renderReceipt(final Map<String, Object> params) {
    return renderTemplate("receipt", params);
  }

  public String renderExample(final Map<String, Object> params) {
    return renderTemplate("example", params);
  }

  private String renderTemplate(final String template, final Map<String, Object> params) {
    final Context context = new Context();
    context.setVariables(params);

    return templateEngine.process(template, context);
  }
}
