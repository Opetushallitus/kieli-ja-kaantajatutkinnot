package fi.oph.vkt.api.dto.examiner;

import fi.oph.vkt.api.dto.EnrollmentDTOSkillFields;
import fi.oph.vkt.api.dto.FreeEnrollmentAttachmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPaymentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPersonDTO;
import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerEnrollmentAppointmentDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull LocalDateTime enrollmentTime,
  ClerkPersonDTO person,
  @NonNull @NotNull Boolean oralSkill,
  @NonNull @NotNull Boolean textualSkill,
  @NonNull @NotNull Boolean understandingSkill,
  @NonNull @NotNull Boolean speakingPartialExam,
  @NonNull @NotNull Boolean speechComprehensionPartialExam,
  @NonNull @NotNull Boolean writingPartialExam,
  @NonNull @NotNull Boolean readingComprehensionPartialExam,
  @NonNull @NotNull EnrollmentAppointmentStatus status,
  @NonNull @NotNull Boolean hasPreviousEnrollment,
  String previousEnrollment,
  @NonNull @NotBlank String email,
  String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName,
  @NonNull @NotNull List<ClerkPaymentDTO> payments,
  ExaminerExamEventDTO examEvent,
  ExaminerAuthLinkDTO authLink,
  String paymentLinkUrl,
  List<FreeEnrollmentAttachmentDTO> attachments
)
  implements EnrollmentDTOSkillFields {}
