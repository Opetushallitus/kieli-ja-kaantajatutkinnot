package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.ExamSessionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkUpdateExamDateDTO(
  @NonNull @NotNull LocalDate examDate,
  @NonNull @NotNull LocalDate registrationStartDate,
  @NonNull @NotNull LocalDate registrationEndDate,
  @NotEmpty List<ExamSessionType> examTypes,
  @NotEmpty List<@Valid CreateClerkExamDateLanguageDTO> languages
) {}
