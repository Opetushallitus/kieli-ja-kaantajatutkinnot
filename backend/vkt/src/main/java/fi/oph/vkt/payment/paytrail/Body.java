package fi.oph.vkt.payment.paytrail;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record Body(
  @NonNull @NotNull @Size(max = 200) String stamp,
  @NonNull @NotNull @Size(max = 200) String reference,
  int amount,
  @NonNull @NotNull String currency,
  @NonNull @NotNull String language,
  @NonNull @NotNull List<Item> items,
  @NonNull @NotNull RedirectUrls redirectUrls,
  @JsonInclude(JsonInclude.Include.NON_NULL) RedirectUrls callbackUrls,
  @NonNull @NotNull Customer customer
) {}
