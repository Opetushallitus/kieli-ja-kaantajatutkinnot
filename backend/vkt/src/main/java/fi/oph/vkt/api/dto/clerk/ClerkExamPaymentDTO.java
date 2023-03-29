package fi.oph.vkt.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkExamPaymentDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotBlank String paymentId,
  @NonNull @NotNull Long amount
) {}
