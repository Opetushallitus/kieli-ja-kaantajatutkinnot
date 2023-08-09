package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkPaymentAuditDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotBlank String transactionId,
  @NonNull @NotNull Integer amount,
  @NonNull @NotNull PaymentStatus status,
  @NonNull @NotNull String modifiedAt,
  String refundedAt
) {}
