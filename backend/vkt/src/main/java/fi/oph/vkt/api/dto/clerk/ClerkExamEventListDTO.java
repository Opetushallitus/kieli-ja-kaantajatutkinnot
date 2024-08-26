package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkExamEventListDTO(
  @NonNull Long id,
  @NonNull ExamLanguage language,
  @NonNull ExamLevel level,
  @NonNull LocalDate date,
  @NonNull LocalDateTime registrationCloses,
  @NonNull LocalDateTime registrationOpens,
  @NonNull Long participants,
  @NonNull Long maxParticipants,
  @NonNull Boolean isUnusedSeats,
  @NonNull Boolean isHidden,
  Long unApprovedFreeEnrollments
) {}
