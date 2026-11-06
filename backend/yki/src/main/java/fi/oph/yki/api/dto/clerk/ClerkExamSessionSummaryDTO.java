package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import java.util.List;

public record ClerkExamSessionSummaryDTO(
  long id,
  LocalDate date,
  String language,
  String level,
  List<ClerkExamSessionLocationDTO> location
) {}
