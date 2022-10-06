package fi.oph.vkt.api.dto;

import fi.oph.vkt.model.type.ExamLanguage;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicExamEventDTO(
  @NonNull Long id,
  @NonNull ExamLanguage language,
  @NonNull LocalDate date,
  @NonNull LocalDate registrationCloses,
  @NonNull Long participants,
  @NonNull Integer maxParticipants,
  @NonNull Boolean hasCongestion
) {}
