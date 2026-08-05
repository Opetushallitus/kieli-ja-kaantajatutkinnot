package fi.oph.yki.api.clerk;

import fi.oph.yki.api.dto.clerk.ClerkPaymentReportRowDTO;
import fi.oph.yki.service.ClerkPaymentReportService;
import fi.oph.yki.view.PaymentReportXlsxView;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@RestController
@RequestMapping(value = "/v2/api/clerk/paymentReport")
public class ClerkPaymentReportController {

  private static final String TAG = "Payment report API";

  @Resource
  private ClerkPaymentReportService clerkPaymentReportService;

  @GetMapping("/excel")
  @Operation(tags = TAG, summary = "Download payment report as Excel")
  public AbstractXlsxView getPaymentReportExcel(@RequestParam final LocalDate from, @RequestParam final LocalDate to) {
    final List<ClerkPaymentReportRowDTO> rows = clerkPaymentReportService.getPaymentReport(from, to);
    return new PaymentReportXlsxView(rows, from, to);
  }
}
