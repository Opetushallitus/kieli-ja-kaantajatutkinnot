package fi.oph.vkt.api.dto.clerk;

import java.time.LocalDateTime;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkPaymentLinkDTO(@NonNull @NotNull String url, @NonNull @NotNull LocalDateTime expires) {}
