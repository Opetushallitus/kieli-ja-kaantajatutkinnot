package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import lombok.Builder;

@Builder
public record ClerkExamDateLanguageDTO(
  Long id,
  String languageCode,
  String levelCode,
  LocalDate evaluationStartDate,
  LocalDate evaluationEndDate
) {}
