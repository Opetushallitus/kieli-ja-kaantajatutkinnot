package fi.oph.vkt.api.dto.clerk;

import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkPaymentLinkDTO(@NonNull @NotBlank String url, @NonNull @NotNull LocalDateTime expiresAt) {}
