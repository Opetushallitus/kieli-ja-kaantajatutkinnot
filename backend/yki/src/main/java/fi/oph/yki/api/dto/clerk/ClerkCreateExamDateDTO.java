package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.ExamSessionType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkCreateExamDateDTO(
  @NonNull @NotNull LocalDate examDate,
  @NonNull @NotNull LocalDate registrationStartDate,
  @NonNull @NotNull LocalDate registrationEndDate,
  @NonNull @NotNull ExamSessionType examType,
  @NotEmpty List<CreateClerkExamDateLanguageDTO> languages
) {}
