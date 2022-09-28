package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import java.time.LocalDate;
import java.util.List;
import javax.validation.constraints.NotNull;
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
  @NonNull @NotNull Boolean isVisible,
  @NonNull @NotNull Integer maxParticipants,
  @NonNull @NotNull List<ClerkEnrollmentDTO> enrollments
) {}
