package fi.oph.vkt.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.vkt.api.dto.clerk.ClerkPaymentDTO;
import fi.oph.vkt.service.ClerkPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/clerk/payment", consumes = APPLICATION_JSON_VALUE, produces = APPLICATION_JSON_VALUE)
public class ClerkPaymentController {

  private static final String TAG_PAYMENT = "Payment API";

  @Resource
  private ClerkPaymentService clerkPaymentService;

  @PutMapping("/{paymentId:\\d+}/refunded")
  @Operation(tags = TAG_PAYMENT, summary = "Mark payment as refunded")
  public ClerkPaymentDTO setRefunded(@PathVariable final long paymentId) {
    return clerkPaymentService.setRefunded(paymentId);
  }
}
