package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import lombok.Builder;

@Builder
public record ClerkExamDateDTO(
  Long id,
  LocalDate examDate,
  LocalDate registrationStartDate,
  LocalDate registrationEndDate
) {}
