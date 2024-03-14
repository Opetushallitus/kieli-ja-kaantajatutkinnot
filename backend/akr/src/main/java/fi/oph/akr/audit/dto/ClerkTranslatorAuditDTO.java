package fi.oph.akr.audit.dto;

import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.model.PersonalData;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkTranslatorAuditDTO(
  @NonNull Long id,
  @NonNull Integer version,
  @NonNull Boolean isIndividualised,
  @NonNull Boolean hasIndividualisedAddress,
  @NonNull String firstName,
  @NonNull String lastName,
  @NonNull String nickName,
  String identityNumber,
  String email,
  String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country,
  String extraInformation,
  @NonNull Boolean isAssuranceGiven
)
  implements AuditEntityDTO {
  public ClerkTranslatorAuditDTO(Translator translator, PersonalData personalData) {
    this(
      translator.getId(),
      translator.getVersion(),
      personalData.getIndividualised(),
      personalData.getHasIndividualisedAddress(),
      personalData.getFirstName(),
      personalData.getLastName(),
      personalData.getNickName(),
      personalData.getIdentityNumber(),
      personalData.getEmail(),
      personalData.getPhoneNumber(),
      personalData.getStreet(),
      personalData.getPostalCode(),
      personalData.getTown(),
      personalData.getTown(),
      translator.getExtraInformation(),
      translator.isAssuranceGiven()
    );
  }
}
