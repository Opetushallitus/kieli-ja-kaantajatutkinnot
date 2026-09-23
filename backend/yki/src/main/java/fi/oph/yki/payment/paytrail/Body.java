package fi.oph.yki.payment.paytrail;

import com.fasterxml.jackson.annotation.JsonInclude;
import fi.oph.yki.payment.paytrail.Item;
import fi.oph.yki.payment.paytrail.RedirectUrls;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

import java.util.List;

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
