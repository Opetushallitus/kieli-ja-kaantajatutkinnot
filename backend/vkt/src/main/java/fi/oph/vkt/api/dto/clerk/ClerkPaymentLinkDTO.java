package fi.oph.vkt.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkPaymentLinkDTO(@NonNull @NotBlank String url, @NonNull @NotNull LocalDateTime expiresAt) {}
