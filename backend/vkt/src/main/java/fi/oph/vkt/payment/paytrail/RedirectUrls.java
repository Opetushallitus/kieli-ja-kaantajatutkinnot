package fi.oph.vkt.payment.paytrail;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record RedirectUrls(
  @NonNull @NotNull @Size(max = 200) String success,
  @NonNull @NotNull @Size(max = 200) String cancel
) {}
