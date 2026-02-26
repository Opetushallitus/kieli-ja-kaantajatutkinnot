package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
public record ClerkExamDateDTO(
  Long id,
  LocalDate examDate,
  LocalDate registrationStartDate,
  LocalDate registrationEndDate,
  List<ClerkExamDateLanguageDTO> languages
) {}
