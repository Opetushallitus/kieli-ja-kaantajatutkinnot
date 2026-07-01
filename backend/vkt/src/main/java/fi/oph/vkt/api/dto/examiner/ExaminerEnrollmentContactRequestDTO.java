package fi.oph.vkt.api.dto.examiner;

import fi.oph.vkt.api.dto.FreeEnrollmentAttachmentDTO;
import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerEnrollmentContactRequestDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull LocalDateTime enrollmentTime,
  Boolean isFullExam,
  String partialExamSelection,
  @NonNull @NotNull EnrollmentAppointmentStatus status,
  @NonNull @NotNull Boolean hasPreviousEnrollment,
  @NonNull @NotBlank String phoneNumber,
  @NonNull @NotBlank String email,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName,
  String message,
  List<FreeEnrollmentAttachmentDTO> attachments
) {}
