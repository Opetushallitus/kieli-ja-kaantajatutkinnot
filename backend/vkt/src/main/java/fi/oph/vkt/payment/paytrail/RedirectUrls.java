package fi.oph.vkt.payment.paytrail;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record RedirectUrls(
  @NonNull @NotNull @Size(max = 200) String success,
  @NonNull @NotNull @Size(max = 200) String cancel
) {}
