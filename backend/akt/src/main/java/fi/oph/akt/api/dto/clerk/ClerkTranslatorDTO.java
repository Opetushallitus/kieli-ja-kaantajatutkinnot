package fi.oph.akt.api.dto.clerk;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkTranslatorDTO(
  @NonNull Long id,
  @NonNull Integer version,
  @NonNull String firstName,
  @NonNull String lastName,
  String identityNumber,
  String email,
  String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country,
  String extraInformation,
  @NonNull Boolean isAssuranceGiven,
  @NonNull List<AuthorisationDTO> authorisations
) {}
