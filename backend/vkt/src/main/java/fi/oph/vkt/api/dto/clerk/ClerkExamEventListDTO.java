package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.exam.ExamLanguage;
import fi.oph.vkt.model.exam.ExamLevel;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkExamEventListDTO(
  @NonNull Long id,
  @NonNull ExamLanguage language,
  @NonNull ExamLevel level,
  @NonNull LocalDate date,
  @NonNull LocalDate registrationCloses,
  @NonNull Integer participants,
  @NonNull Integer maxParticipants,
  @NonNull Boolean isPublic
) {}
