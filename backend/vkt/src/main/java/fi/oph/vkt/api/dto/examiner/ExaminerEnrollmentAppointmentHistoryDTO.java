package fi.oph.vkt.api.dto.examiner;

import fi.oph.vkt.api.dto.EnrollmentDTOSkillFields;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerEnrollmentAppointmentHistoryDTO(
  @NonNull @NotNull LocalDateTime enrollmentTime,
  @NonNull @NotNull Boolean oralSkill,
  @NonNull @NotNull Boolean textualSkill,
  @NonNull @NotNull Boolean understandingSkill,
  @NonNull @NotNull Boolean speakingPartialExam,
  @NonNull @NotNull Boolean speechComprehensionPartialExam,
  @NonNull @NotNull Boolean writingPartialExam,
  @NonNull @NotNull Boolean readingComprehensionPartialExam,
  ExaminerExamEventDTO examEvent,
  ExaminerEnrollmentGradesDTO grades,
  @NonNull @NotBlank String examinerName
)
  implements EnrollmentDTOSkillFields {}
