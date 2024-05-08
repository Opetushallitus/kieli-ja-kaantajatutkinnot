package fi.oph.otr.audit.dto;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterUpdateDTO;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.Region;
import fi.oph.otr.onr.model.PersonalData;
import java.util.List;
import lombok.NonNull;

public record InterpreterAuditDTO(
  @NonNull Long id,
  @NonNull Integer version,
  @NonNull Boolean isIndividualised,
  @NonNull Boolean hasIndividualisedAddress,
  @NonNull String identityNumber,
  @NonNull String lastName,
  @NonNull String firstName,
  @NonNull String nickName,
  String email,
  @NonNull Boolean permissionToPublishEmail,
  String phoneNumber,
  @NonNull Boolean permissionToPublishPhone,
  String otherContactInfo,
  @NonNull Boolean permissionToPublishOtherContactInfo,
  String street,
  String postalCode,
  String town,
  String country,
  String extraInformation,
  @NonNull List<String> regions,
  @NonNull Boolean isAssuranceGiven
)
  implements AuditEntityDTO {
  public InterpreterAuditDTO(Interpreter interpreter, PersonalData personalData) {
    this(
      interpreter.getId(),
      interpreter.getVersion(),
      personalData.getIndividualised(),
      personalData.getHasIndividualisedAddress(),
      personalData.getIdentityNumber(),
      personalData.getLastName(),
      personalData.getFirstName(),
      personalData.getNickName(),
      personalData.getEmail(),
      interpreter.isPermissionToPublishEmail(),
      personalData.getPhoneNumber(),
      interpreter.isPermissionToPublishPhone(),
      interpreter.getOtherContactInformation(),
      interpreter.isPermissionToPublishOtherContactInfo(),
      personalData.getStreet(),
      personalData.getPostalCode(),
      personalData.getTown(),
      personalData.getCountry(),
      interpreter.getExtraInformation(),
      interpreter.getRegions().stream().map(Region::getCode).toList(),
      interpreter.isAssuranceGiven()
    );
  }
  public InterpreterAuditDTO(ClerkInterpreterUpdateDTO interpreter) {
    this(
      interpreter.id(),
      interpreter.version(),
      interpreter.isIndividualised(),
      interpreter.hasIndividualisedAddress(),
      interpreter.identityNumber(),
      interpreter.lastName(),
      interpreter.firstName(),
      interpreter.nickName(),
      interpreter.email(),
      interpreter.permissionToPublishEmail(),
      interpreter.phoneNumber(),
      interpreter.permissionToPublishPhone(),
      interpreter.otherContactInfo(),
      interpreter.permissionToPublishOtherContactInfo(),
      interpreter.street(),
      interpreter.postalCode(),
      interpreter.town(),
      interpreter.country(),
      interpreter.extraInformation(),
      interpreter.regions(),
      interpreter.isAssuranceGiven()
    );
  }
  public InterpreterAuditDTO(ClerkInterpreterDTO interpreter) {
    this(
      interpreter.id(),
      interpreter.version(),
      interpreter.isIndividualised(),
      interpreter.hasIndividualisedAddress(),
      interpreter.identityNumber(),
      interpreter.lastName(),
      interpreter.firstName(),
      interpreter.nickName(),
      interpreter.email(),
      interpreter.permissionToPublishEmail(),
      interpreter.phoneNumber(),
      interpreter.permissionToPublishPhone(),
      interpreter.otherContactInfo(),
      interpreter.permissionToPublishOtherContactInfo(),
      interpreter.street(),
      interpreter.postalCode(),
      interpreter.town(),
      interpreter.country(),
      interpreter.extraInformation(),
      interpreter.regions(),
      interpreter.isAssuranceGiven()
    );
  }
}
