package fi.oph.vkt.payment.paytrail;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record Body(
  @NonNull @NotNull List<Item> items,
  @NonNull @NotNull @Size(max = 200) String stamp,
  @NonNull @NotNull @Size(max = 200) String reference,
  @NonNull @NotNull Integer amount,
  @NonNull @NotNull String currency,
  @NonNull @NotNull String language,
  @NonNull @NotNull Customer customer,
  @NonNull @NotNull RedirectUrls redirectUrls,
  @JsonInclude(JsonInclude.Include.NON_NULL) RedirectUrls callbackUrls
) {}
