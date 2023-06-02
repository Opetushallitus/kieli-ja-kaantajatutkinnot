package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.PaymentStatus;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkPaymentDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotBlank String transactionId,
  @NonNull @NotNull Integer amount,
  @NonNull @NotNull PaymentStatus status,
  @NonNull @NotNull LocalDateTime modifiedAt
) {}
