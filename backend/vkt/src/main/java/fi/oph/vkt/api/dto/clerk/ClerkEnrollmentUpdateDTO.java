package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.api.dto.EnrollmentDTOCommonFields;
import fi.oph.vkt.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
  @Size(max = 1024) String previousEnrollment,
  @NonNull @NotNull Boolean digitalCertificateConsent,
  @Size(max = 255) @NonNull @NotBlank String email,
  @Size(max = 255) @NonNull @NotBlank String phoneNumber,
  @Size(max = 255) String street,
  @Size(max = 255) String postalCode,
  @Size(max = 255) String town,
  @Size(max = 255) String country
)
  implements EnrollmentDTOCommonFields {
  public ClerkEnrollmentUpdateDTO {
    previousEnrollment = StringUtil.sanitize(previousEnrollment);
    email = StringUtil.sanitize(email);
    phoneNumber = StringUtil.sanitize(phoneNumber);
    street = StringUtil.sanitize(street);
    postalCode = StringUtil.sanitize(postalCode);
    town = StringUtil.sanitize(town);
    country = StringUtil.sanitize(country);
  }
}
