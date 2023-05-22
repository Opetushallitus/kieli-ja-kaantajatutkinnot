package fi.oph.vkt.api.clerk;

import static org.springframework.http.MediaType.ALL_VALUE;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.MediaType.APPLICATION_PDF_VALUE;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentMoveDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentStatusChangeDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentUpdateDTO;
import fi.oph.vkt.service.ClerkEnrollmentService;
import fi.oph.vkt.service.receipt.ReceiptData;
import fi.oph.vkt.service.receipt.ReceiptRenderer;
import fi.oph.vkt.util.localisation.Language;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
  value = "/api/v1/clerk/enrollment",
  consumes = APPLICATION_JSON_VALUE,
  produces = APPLICATION_JSON_VALUE
)
public class ClerkEnrollmentController {

  private static final String TAG_ENROLLMENT = "Enrollment API";

  @Resource
  private ClerkEnrollmentService clerkEnrollmentService;

  @Resource
  private ReceiptRenderer receiptRenderer;

  @PutMapping
  @Operation(tags = TAG_ENROLLMENT, summary = "Update enrollment")
  public ClerkEnrollmentDTO updateEnrollment(@RequestBody @Valid final ClerkEnrollmentUpdateDTO dto) {
    return clerkEnrollmentService.update(dto);
  }

  @PutMapping(path = "/status")
  @Operation(tags = TAG_ENROLLMENT, summary = "Change enrollment status")
  public ClerkEnrollmentDTO changeStatus(@RequestBody @Valid final ClerkEnrollmentStatusChangeDTO dto) {
    return clerkEnrollmentService.changeStatus(dto);
  }

  @PutMapping(path = "/move")
  @Operation(tags = TAG_ENROLLMENT, summary = "Move enrollment to another exam event")
  public ClerkEnrollmentDTO move(@RequestBody @Valid final ClerkEnrollmentMoveDTO dto) {
    return clerkEnrollmentService.move(dto);
  }

  @GetMapping(path = "/receipt/{enrollmentId:\\d+}", consumes = ALL_VALUE, produces = APPLICATION_PDF_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Download payment PDF")
  public ResponseEntity<InputStreamResource> downloadReceipt(
    final HttpServletResponse response,
    @PathVariable final long enrollmentId
  ) throws IOException, InterruptedException {
    final String filename = String.format("VKT_kuitti_%d.pdf", enrollmentId);
    response.addHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", filename));

    // TODO: possibility to download swedish receipt?
    final ReceiptData receiptData = receiptRenderer.getReceiptData(enrollmentId, Language.FI);
    final ByteArrayInputStream bis = new ByteArrayInputStream(receiptRenderer.getReceiptPdfBytes(receiptData));
    return ResponseEntity.ok().body(new InputStreamResource(bis));
  }
}
