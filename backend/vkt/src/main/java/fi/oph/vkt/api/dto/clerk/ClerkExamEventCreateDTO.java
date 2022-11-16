package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import java.time.LocalDate;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkExamEventCreateDTO(
  @NonNull @NotNull ExamLanguage language,
  @NonNull @NotNull ExamLevel level,
  @NonNull @NotNull LocalDate date,
  @NonNull @NotNull LocalDate registrationCloses,
  @NonNull @NotNull Boolean isHidden,
  @NonNull @NotNull Long maxParticipants
)
  implements ClerkExamEventDTOCommonFields {}
