package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.api.dto.EnrollmentGradeDTO;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerEnrollmentGradesDTO(
  @NonNull @NotNull Integer version,
  EnrollmentGradeDTO speakingPartialExam,
  EnrollmentGradeDTO speechComprehensionPartialExam,
  EnrollmentGradeDTO writingPartialExam,
  EnrollmentGradeDTO readingComprehensionPartialExam
) {}
