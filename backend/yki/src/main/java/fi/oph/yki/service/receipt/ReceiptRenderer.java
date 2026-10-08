package fi.oph.yki.service.receipt;

import com.github.jhonnymertz.wkhtmltopdf.wrapper.Pdf;
import com.github.jhonnymertz.wkhtmltopdf.wrapper.configurations.WrapperConfig;
import fi.oph.yki.util.TemplateRenderer;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReceiptRenderer {

  private final TemplateRenderer templateRenderer;

  public byte[] renderPdf(final String templateName, final Map<String, Object> params, final Locale locale)
    throws IOException, InterruptedException {
    final String html = templateRenderer.render(templateName, params, locale);
    final Pdf pdf = new Pdf(new WrapperConfig("wkhtmltopdf"));
    pdf.addPageFromString(html);
    return pdf.getPDF();
  }
}
