package fi.oph.vkt.payment.paytrail;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record Item(
  @NonNull @NotNull Integer unitPrice,
  @NonNull @NotNull Integer units,
  @NonNull @NotNull Integer vatPercentage,
  @NonNull @NotNull @Size(max = 100) String productCode
) {}
