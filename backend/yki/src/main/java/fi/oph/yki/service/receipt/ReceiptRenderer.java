package fi.oph.yki.service.receipt;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder.FontStyle;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.openhtmltopdf.svgsupport.BatikSVGDrawer;
import fi.oph.yki.util.TemplateRenderer;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.helper.W3CDom;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;

@Component
@RequiredArgsConstructor
public class ReceiptRenderer {

  // Liberation Sans is the font production receipts were rendered with when wkhtmltopdf was used
  private static final String FONT_FAMILY = "Liberation Sans";
  private static final String FONT_REGULAR = "/fonts/LiberationSans-Regular.ttf";
  private static final String FONT_BOLD = "/fonts/LiberationSans-Bold.ttf";

  private final TemplateRenderer templateRenderer;

  public byte[] renderPdf(final String templateName, final Map<String, Object> params, final Locale locale)
    throws IOException {
    final String html = templateRenderer.render(templateName, params, locale);
    // OpenHTMLtoPDF reads XML, so the HTML is parsed with jsoup first (e.g. &nbsp; is not an XML entity)
    final Document document = new W3CDom().fromJsoup(Jsoup.parse(html));

    try (final ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      new PdfRendererBuilder()
        .useSVGDrawer(new BatikSVGDrawer())
        .useFont(
          () -> ReceiptRenderer.class.getResourceAsStream(FONT_REGULAR),
          FONT_FAMILY,
          400,
          FontStyle.NORMAL,
          true
        )
        .useFont(() -> ReceiptRenderer.class.getResourceAsStream(FONT_BOLD), FONT_FAMILY, 700, FontStyle.NORMAL, true)
        .withW3cDocument(document, null)
        .toStream(outputStream)
        .run();

      return outputStream.toByteArray();
    }
  }
}
