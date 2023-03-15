package fi.oph.vkt.api.dto;

import fi.oph.vkt.util.StringUtil;
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
  @Size(max = 1024) String previousEnrollment,
  @NonNull @NotNull Boolean digitalCertificateConsent,
  @NonNull @NotBlank @Size(max = 255) String email,
  @NonNull @NotBlank @Size(max = 255) String phoneNumber,
  @Size(max = 255) String street,
  @Size(max = 8) String postalCode,
  @Size(max = 255) String town,
  @Size(max = 64) String country
) {
  public PublicEnrollmentCreateDTO {
    previousEnrollment = StringUtil.trim(previousEnrollment);
    email = StringUtil.trim(email);
    phoneNumber = StringUtil.trim(phoneNumber);
    street = StringUtil.trim(street);
    postalCode = StringUtil.trim(postalCode);
    town = StringUtil.trim(town);
    country = StringUtil.trim(country);
  }
}
