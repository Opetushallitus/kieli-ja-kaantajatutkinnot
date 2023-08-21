package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
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
  @NonNull Long participants,
  @NonNull Long maxParticipants,
  @NonNull Boolean isUnusedSeats,
  @NonNull Boolean isHidden
) {}
