package fi.oph.akr.audit.dto;

import fi.oph.akr.api.dto.clerk.ClerkTranslatorAddressDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorDTO;
import fi.oph.akr.api.dto.translator.TranslatorAddressDTO;
import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.model.PersonalData;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
  Map<String, TranslatorAddressDTO> address,
  String extraInformation,
  @NonNull Boolean isAssuranceGiven,
  String selectedSource,
  String selectedType
)
  implements AuditEntityDTO {
  public ClerkTranslatorAuditDTO(final ClerkTranslatorDTO translator) {
    this(
      translator.id(),
      translator.version(),
      translator.isIndividualised(),
      translator.hasIndividualisedAddress(),
      translator.firstName(),
      translator.lastName(),
      translator.nickName(),
      translator.identityNumber(),
      translator.email(),
      translator.phoneNumber(),
      translator
        .address()
        .stream()
        .collect(
          Collectors.toMap(
            address -> address.source() + ":" + address.type(),
            TranslatorAddressDTO::new,
            (address1, address2) -> {
              final Logger log = LoggerFactory.getLogger(ClerkTranslatorAuditDTO.class);
              log.warn(
                String.format(
                  "Address with duplicate ONR source. Address 1: '%s', address 2: '%s'",
                  address1.source(),
                  address2.source()
                )
              );
              return address2;
            }
          )
        ),
      translator.extraInformation(),
      translator.isAssuranceGiven(),
      translator.address().stream().filter(ClerkTranslatorAddressDTO::selected).findAny().get().source().toString(),
      translator.address().stream().filter(ClerkTranslatorAddressDTO::selected).findAny().get().type().toString()
    );
  }

  public ClerkTranslatorAuditDTO(final Translator translator, final PersonalData personalData) {
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
      personalData
        .getAddress()
        .stream()
        .collect(
          Collectors.toMap(
            address -> address.source() + ":" + address.type(),
            Function.identity(),
            (address1, address2) -> {
              final Logger log = LoggerFactory.getLogger(ClerkTranslatorAuditDTO.class);
              log.warn(
                String.format(
                  "Address with duplicate ONR source. Address 1: '%s', address 2: '%s'",
                  address1.source(),
                  address2.source()
                )
              );
              return address2;
            }
          )
        ),
      translator.getExtraInformation(),
      translator.isAssuranceGiven(),
      translator.getSelectedSource(),
      translator.getSelectedType()
    );
  }
}
