package fi.oph.vkt.api.dto.clerk;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import fi.oph.vkt.util.Trim;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkEnrollmentUpdateDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull Boolean oralSkill,
  @NonNull @NotNull Boolean textualSkill,
  @NonNull @NotNull Boolean understandingSkill,
  @NonNull @NotNull Boolean speakingPartialExam,
  @NonNull @NotNull Boolean speechComprehensionPartialExam,
  @NonNull @NotNull Boolean writingPartialExam,
  @NonNull @NotNull Boolean readingComprehensionPartialExam,
  @Trim String previousEnrollment,
  @NonNull @NotNull Boolean digitalCertificateConsent,
  @NonNull @NotBlank String email,
  @NonNull @NotBlank String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country
) {
    @Trim
    public ClerkEnrollmentUpdateDTO {
    }
}
