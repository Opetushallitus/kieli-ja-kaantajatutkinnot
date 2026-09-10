package fi.oph.yki.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import fi.oph.yki.model.type.Subtest;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PublicEvaluationOrderDTO(
  Long id,
  String languageCode,
  String levelCode,
  LocalDate examDate,
  List<Subtest> subtests
) {}
