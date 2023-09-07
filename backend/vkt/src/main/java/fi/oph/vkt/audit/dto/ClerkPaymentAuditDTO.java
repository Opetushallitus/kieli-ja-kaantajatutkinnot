package fi.oph.vkt.audit.dto;

import fi.oph.vkt.model.type.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkPaymentAuditDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull String modifiedAt,
  @NonNull @NotBlank String transactionId,
  @NonNull @NotNull Integer amount,
  @NonNull @NotNull String reference,
  @NonNull @NotNull String paymentUrl,
  @NonNull @NotNull PaymentStatus status,
  String refundedAt
)
  implements AuditEntityDTO {}
