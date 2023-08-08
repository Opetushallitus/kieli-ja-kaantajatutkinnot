package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkExamEventAuditDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull ExamLanguage language,
  @NonNull @NotNull ExamLevel level,
  @NonNull @NotNull String date,
  @NonNull @NotNull String registrationCloses,
  @NonNull @NotNull Boolean isHidden,
  @NonNull @NotNull Long maxParticipants
) {}
