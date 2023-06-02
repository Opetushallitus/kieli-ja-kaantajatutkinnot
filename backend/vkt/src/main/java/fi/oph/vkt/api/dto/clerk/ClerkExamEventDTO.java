package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkExamEventDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull ExamLanguage language,
  @NonNull @NotNull ExamLevel level,
  @NonNull @NotNull LocalDate date,
  @NonNull @NotNull LocalDate registrationCloses,
  @NonNull @NotNull Boolean isHidden,
  @NonNull @NotNull Long maxParticipants,
  @NonNull @NotNull List<ClerkEnrollmentDTO> enrollments
) {}
