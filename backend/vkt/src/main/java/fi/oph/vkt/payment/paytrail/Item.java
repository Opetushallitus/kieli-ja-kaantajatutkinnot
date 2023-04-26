package fi.oph.vkt.payment.paytrail;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record Item(
  int unitPrice,
  int units,
  int vatPercentage,
  @NonNull @NotNull @Size(max = 100) String productCode
) {}
