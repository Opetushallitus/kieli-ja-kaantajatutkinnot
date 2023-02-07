package fi.oph.vkt.api.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicEnrollmentCreateDTO(
  @NonNull @NotNull Boolean oralSkill,
  @NonNull @NotNull Boolean textualSkill,
  @NonNull @NotNull Boolean understandingSkill,
  @NonNull @NotNull Boolean speakingPartialExam,
  @NonNull @NotNull Boolean speechComprehensionPartialExam,
  @NonNull @NotNull Boolean writingPartialExam,
  @NonNull @NotNull Boolean readingComprehensionPartialExam,
  @Size(min = 1, max = 1024) String previousEnrollment,
  @NonNull @NotNull Boolean digitalCertificateConsent,
  @NonNull @NotBlank @Size(min = 1, max = 255) String email,
  @NonNull @NotBlank @Size(min = 1, max = 255) String phoneNumber,
  @Size(min = 1, max = 255) String street,
  @Size(min = 1, max = 8) String postalCode,
  @Size(min = 1, max = 255) String town,
  @Size(min = 1, max = 16) String country
) {}
