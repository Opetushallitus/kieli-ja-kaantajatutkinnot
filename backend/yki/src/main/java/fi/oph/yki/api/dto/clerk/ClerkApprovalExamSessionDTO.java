package fi.oph.yki.api.dto.clerk;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkApprovalExamSessionDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull String examDate,
  @NonNull @NotNull String language,
  @NonNull @NotNull String level
) {}
