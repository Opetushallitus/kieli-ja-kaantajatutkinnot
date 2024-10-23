package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.EnrollmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkEnrollmentContactRequestDTO(
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
  @NonNull @NotNull EnrollmentStatus status,
  String previousEnrollment,
  @NonNull @NotBlank String email,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName
) {}
