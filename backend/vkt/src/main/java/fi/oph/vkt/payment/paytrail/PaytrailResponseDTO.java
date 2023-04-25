package fi.oph.vkt.payment.paytrail;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.jackson.Jacksonized;

@Builder
@Jacksonized
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaytrailResponseDTO {

  private String transactionId;
  private String href;
  private String reference;
}
