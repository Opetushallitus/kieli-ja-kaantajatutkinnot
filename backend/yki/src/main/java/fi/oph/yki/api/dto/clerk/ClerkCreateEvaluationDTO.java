package fi.oph.yki.api.dto.clerk;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
public record ClerkCreateEvaluationDTO(
  @NotNull LocalDate evaluationStartDate,
  @NotNull LocalDate evaluationEndDate,
  List<@Valid LanguageEvaluationOverride> overrides
) {
  @Builder
  public record LanguageEvaluationOverride(
    @NotNull Long examDateLanguageId,
    @NotNull LocalDate evaluationStartDate,
    @NotNull LocalDate evaluationEndDate
  ) {}
}
