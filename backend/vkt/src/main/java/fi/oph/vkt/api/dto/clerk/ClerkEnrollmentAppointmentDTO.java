package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.api.dto.EnrollmentDTOSkillFields;
import fi.oph.vkt.api.dto.examiner.ExaminerAuthLinkDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventDTO;
import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkEnrollmentAppointmentDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull LocalDateTime enrollmentTime,
  @NonNull @NotNull Boolean oralSkill,
  @NonNull @NotNull Boolean textualSkill,
  @NonNull @NotNull Boolean understandingSkill,
  @NonNull @NotNull Boolean speakingPartialExam,
  @NonNull @NotNull Boolean speechComprehensionPartialExam,
  @NonNull @NotNull Boolean writingPartialExam,
  @NonNull @NotNull Boolean readingComprehensionPartialExam,
  @NonNull @NotNull EnrollmentAppointmentStatus status,
  String previousEnrollment,
  @NonNull @NotBlank String email,
  String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName,
  @NonNull @NotBlank ExaminerAuthLinkDTO authLink,
  @NonNull @NotNull List<ClerkPaymentDTO> payments,
  ExaminerExamEventDTO examEvent
)
  implements EnrollmentDTOSkillFields {}
