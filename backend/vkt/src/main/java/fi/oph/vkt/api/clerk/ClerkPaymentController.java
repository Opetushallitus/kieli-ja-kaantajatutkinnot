package fi.oph.vkt.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.vkt.api.dto.clerk.ClerkPaymentDTO;
import fi.oph.vkt.service.ClerkPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@RestController
@RequestMapping(value = "/api/v1/clerk/payment", produces = APPLICATION_JSON_VALUE)
public class ClerkPaymentController {

  private static final String TAG_PAYMENT = "Payment API";

  @Resource
  private ClerkPaymentService clerkPaymentService;

  @PutMapping("/{paymentId:\\d+}/refunded")
  @Operation(tags = TAG_PAYMENT, summary = "Mark payment as refunded")
  public ClerkPaymentDTO setRefunded(@PathVariable final long paymentId) {
    return clerkPaymentService.setRefunded(paymentId);
  }

  @GetMapping("/downloadReport")
  @Operation(tags = TAG_PAYMENT, summary = "Mark payment as refunded")
  public AbstractXlsxView downloadReport(
    @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) final LocalDate from,
    @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) final LocalDate to
  ) {
    return clerkPaymentService.getPaymentReportExcel(from, to);
  }
}
