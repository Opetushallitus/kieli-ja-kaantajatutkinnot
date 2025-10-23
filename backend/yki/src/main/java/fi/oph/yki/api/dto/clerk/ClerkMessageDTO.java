package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.RegistrationState;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkMessageDTO(
  @NonNull @NotNull LocalDateTime createdAt,
  @NonNull @NotNull String createdBy,
  @NonNull @NotNull String text,
  @NonNull @NotNull String type
) {}
