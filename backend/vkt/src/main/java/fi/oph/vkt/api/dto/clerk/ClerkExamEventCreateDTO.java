package fi.oph.vkt.api.dto.clerk;

import com.fasterxml.jackson.annotation.JsonFormat;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkExamEventCreateDTO(
  @NonNull @NotNull ExamLanguage language,
  @NonNull @NotNull ExamLevel level,
  @NonNull @NotNull LocalDate date,

  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @NonNull @NotNull LocalDateTime registrationCloses,

  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @NonNull @NotNull LocalDateTime registrationOpens,

  @NonNull @NotNull Boolean isHidden,
  @NonNull @NotNull Long maxParticipants
)
  implements ClerkExamEventDTOCommonFields {}
