package fi.oph.vkt.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicEnrollmentAppointmentUpdateDTO(
  @NotNull long id,
  String previousEnrollment,
  @NonNull @NotNull Boolean digitalCertificateConsent,
  @NonNull @NotBlank String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country
) {}
