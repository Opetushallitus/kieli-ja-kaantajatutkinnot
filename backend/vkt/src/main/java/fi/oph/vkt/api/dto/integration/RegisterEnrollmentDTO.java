package fi.oph.vkt.api.dto.integration;

import fi.oph.vkt.api.dto.EnrollmentDTOSkillFields;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.model.type.EnrollmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record RegisterEnrollmentDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Boolean oralSkill,
  @NonNull @NotNull Boolean textualSkill,
  @NonNull @NotNull Boolean understandingSkill,
  @NonNull @NotNull Boolean speakingPartialExam,
  @NonNull @NotNull Boolean speechComprehensionPartialExam,
  @NonNull @NotNull Boolean writingPartialExam,
  @NonNull @NotNull Boolean readingComprehensionPartialExam,
  @NonNull @NotNull EnrollmentStatus status,
  @NonNull @NotBlank String email,
  @NonNull @NotBlank String phoneNumber,
  @NonNull @NotBlank PublicExamEventDTO examEvent,
  @NonNull @NotBlank RegistryPersonDTO person
)
  implements EnrollmentDTOSkillFields {}
