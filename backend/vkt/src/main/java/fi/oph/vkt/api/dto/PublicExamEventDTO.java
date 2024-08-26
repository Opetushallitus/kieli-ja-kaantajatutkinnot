package fi.oph.vkt.api.dto;

import fi.oph.vkt.model.type.ExamLanguage;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicExamEventDTO(
  @NonNull Long id,
  @NonNull ExamLanguage language,
  @NonNull LocalDate date,
  @NonNull LocalDateTime registrationCloses,
  @NonNull LocalDateTime registrationOpens,
  @NonNull Long openings,
  @NonNull Boolean hasCongestion
) {}
