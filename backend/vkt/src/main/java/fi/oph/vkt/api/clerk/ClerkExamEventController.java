package fi.oph.vkt.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.MediaType.APPLICATION_PDF_VALUE;
import static org.springframework.http.MediaType.TEXT_HTML_VALUE;

import com.github.jhonnymertz.wkhtmltopdf.wrapper.Pdf;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventCreateDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventUpdateDTO;
import fi.oph.vkt.service.ClerkExamEventService;
import fi.oph.vkt.util.TemplateRenderer;
import fi.oph.vkt.view.ExamEventXlsxView;
import io.swagger.v3.oas.annotations.Operation;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@RestController
@RequestMapping(value = "/api/v1/clerk/examEvent", produces = MediaType.APPLICATION_JSON_VALUE)
public class ClerkExamEventController {

  private static final String TAG_EXAM_EVENT = "Exam event API";

  @Resource
  private ClerkExamEventService clerkExamEventService;

  @Resource
  private TemplateRenderer templateRenderer;

  @GetMapping
  @Operation(tags = TAG_EXAM_EVENT, summary = "List all exam events")
  public List<ClerkExamEventListDTO> list() {
    return clerkExamEventService.list();
  }

  @GetMapping(path = "/{examEventId:\\d+}")
  @Operation(tags = TAG_EXAM_EVENT, summary = "Get exam event and enrollments")
  public ClerkExamEventDTO getExamEvent(@PathVariable final long examEventId) {
    return clerkExamEventService.getExamEvent(examEventId);
  }

  @PostMapping(consumes = APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_EXAM_EVENT, summary = "Create exam event")
  public ClerkExamEventDTO createExamEvent(@RequestBody @Valid final ClerkExamEventCreateDTO dto) {
    return clerkExamEventService.createExamEvent(dto);
  }

  @PutMapping(consumes = APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_EXAM_EVENT, summary = "Update exam event")
  public ClerkExamEventDTO updateExamEvent(@RequestBody @Valid final ClerkExamEventUpdateDTO dto) {
    return clerkExamEventService.updateExamEvent(dto);
  }

  @GetMapping(value = "/{examEventId:\\d+}/excel")
  @Operation(tags = TAG_EXAM_EVENT, summary = "Download exam event excel")
  public AbstractXlsxView getExamEventExcel(@PathVariable final long examEventId) {
    final ClerkExamEventDTO examEvent = clerkExamEventService.getExamEvent(examEventId);
    return new ExamEventXlsxView(examEvent);
  }

  @GetMapping(value = "/pdf_html", produces = TEXT_HTML_VALUE)
  public String pdfAsHtml() {
    return getReceiptHtml();
  }

  @GetMapping(value = "/pdf", produces = APPLICATION_PDF_VALUE)
  public ResponseEntity<InputStreamResource> pdfWkhtmltopdf(final HttpServletResponse response) throws Exception {
    response.addHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", "testing_wkhtmltopdf.pdf"));

    final String html = getReceiptHtml();

    final Pdf pdf = new Pdf();
    pdf.addPageFromString(html);

    final ByteArrayInputStream bis = new ByteArrayInputStream(pdf.getPDF());
    return ResponseEntity.ok().body(new InputStreamResource(bis));
  }

  private String getReceiptHtml() {
    final Map<String, Object> params = Map.of(
      "dateOfReceipt",
      "24.12.2022",
      "payerName",
      "Väinöläinen, Väinö",
      "paymentDate",
      "24.12.2022",
      "totalAmount",
      "140 €",
      "item",
      Map.of(
        "name",
        "Yleiset kielitutkinnot (YKI) tutkintomaksu",
        "value",
        "140 €",
        "additionalInfos",
        List.of(
          "Suomi, keskitaso, 28.1.2023",
          "Osallistuja: Ainolainen, Aino",
          "Järjestäjä:",
          "Iisalmen kansalaisopisto",
          "Kirkkopuistonkatu 9",
          "IISALMI"
        )
      )
    );
    final String html = templateRenderer.renderReceipt(params);
    return html;
  }
}
