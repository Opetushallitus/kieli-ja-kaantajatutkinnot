package fi.oph.yki.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkApprovalCommentDTO(
  @NonNull @NotBlank String comment,
  @NonNull @NotBlank String commentor,
  @NonNull @NotBlank LocalDateTime timestamp
) {}
