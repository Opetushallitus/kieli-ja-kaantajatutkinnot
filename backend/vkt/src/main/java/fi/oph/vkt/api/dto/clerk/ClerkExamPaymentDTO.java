package fi.oph.vkt.api.dto.clerk;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkExamPaymentDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotBlank String paymentId,
  @NonNull @NotNull Integer amount
) {}
