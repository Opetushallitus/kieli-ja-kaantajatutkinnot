package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.ExamSessionType;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
public record CreateClerkExamDateDTO(
  LocalDate examDate,
  LocalDate registrationStartDate,
  LocalDate registrationEndDate,
  List<ExamSessionType> examTypes,
  List<CreateClerkExamDateLanguageDTO> languages
) {}
