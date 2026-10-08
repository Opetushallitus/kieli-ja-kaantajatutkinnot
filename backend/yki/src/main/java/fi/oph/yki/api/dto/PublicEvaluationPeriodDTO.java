package fi.oph.yki.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.time.LocalDate;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PublicEvaluationPeriodDTO(
  Long id,
  LocalDate examDate,
  String languageCode,
  String levelCode,
  LocalDate evaluationStartDate,
  LocalDate evaluationEndDate,
  boolean open
) {}
