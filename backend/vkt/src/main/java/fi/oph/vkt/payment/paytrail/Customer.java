package fi.oph.vkt.payment.paytrail;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record Customer(
  @NonNull @NotNull @Size(max = 200) String email,
  @Size(max = 15) String phone,
  @Size(max = 50) String firstName,
  @Size(max = 50) String lastName
) {}
