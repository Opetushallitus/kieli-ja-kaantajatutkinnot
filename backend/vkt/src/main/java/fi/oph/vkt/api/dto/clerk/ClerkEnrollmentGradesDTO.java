package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.api.dto.EnrollmentGradeDTO;
import lombok.Builder;

@Builder
public record ClerkEnrollmentGradesDTO(
  EnrollmentGradeDTO speakingPartialExam,
  EnrollmentGradeDTO speechComprehensionPartialExam,
  EnrollmentGradeDTO writingPartialExam,
  EnrollmentGradeDTO readingComprehensionPartialExam
) {}
