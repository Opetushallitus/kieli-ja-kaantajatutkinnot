package fi.oph.yki.api.dto.clerk;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
public record ClerkUpdateEvaluationDTO(@NotNull @NotEmpty List<@Valid LanguageEvaluation> evaluations) {
  @Builder
  public record LanguageEvaluation(
    @NotNull Long examDateLanguageId,
    LocalDate evaluationStartDate,
    LocalDate evaluationEndDate
  ) {}
}
