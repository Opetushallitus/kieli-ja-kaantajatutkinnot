package fi.oph.vkt.payment.paytrail;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record Item(
  @NonNull @NotNull Integer units,
  @NonNull @NotNull Integer unitPrice,
  @NonNull @NotNull Integer vatPercentage,
  @NonNull @NotNull @Size(max = 100) String productCode
) {}
