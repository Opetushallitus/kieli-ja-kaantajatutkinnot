package fi.oph.vkt.api.dto;

import fi.oph.vkt.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicEnrollmentAppointmentUpdateDTO(
  @NotNull long id,
  String previousEnrollment,
  @NonNull @NotNull Boolean digitalCertificateConsent,
  @NonNull @NotBlank String phoneNumber,
  @Size(max = 1024) String street,
  @Size(max = 1024) String postalCode,
  @Size(max = 1024) String town,
  @Size(max = 1024) String country
) {
  public PublicEnrollmentAppointmentUpdateDTO {
    previousEnrollment = StringUtil.sanitize(previousEnrollment);
    street = StringUtil.sanitize(street);
    postalCode = StringUtil.sanitize(postalCode);
    town = StringUtil.sanitize(town);
    country = StringUtil.sanitize(country);
  }
}
