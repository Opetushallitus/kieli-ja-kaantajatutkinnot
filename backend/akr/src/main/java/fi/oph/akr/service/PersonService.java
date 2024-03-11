package fi.oph.akr.service;

import fi.oph.akr.api.dto.clerk.ClerkTranslatorAddressDTO;
import fi.oph.akr.api.dto.clerk.PersonDTO;
import fi.oph.akr.audit.AuditService;
import fi.oph.akr.onr.OnrService;
import jakarta.annotation.Resource;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PersonService {

  @Resource
  private final OnrService onrService;

  @Resource
  private final AuditService auditService;

  public Optional<PersonDTO> findPersonByIdentityNumber(final String identityNumber) throws Exception {
    final Optional<PersonDTO> result = onrService
      .findPersonalDataByIdentityNumber(identityNumber)
      .map(personalData ->
        PersonDTO
          .builder()
          .onrId(personalData.getOnrId())
          .isIndividualised(personalData.getIndividualised())
          .hasIndividualisedAddress(personalData.getHasIndividualisedAddress())
          .identityNumber(personalData.getIdentityNumber())
          .lastName(personalData.getLastName())
          .firstName(personalData.getFirstName())
          .nickName(personalData.getNickName())
          .address(
            personalData
              .getAddress()
              .stream()
              .map(addr ->
                ClerkTranslatorAddressDTO
                  .builder()
                  .street(addr.street())
                  .town(addr.town())
                  .postalCode(addr.postalCode())
                  .country(addr.country())
                  .source(addr.source())
                  .type(addr.type())
                  .selected(false)
                  .build()
              )
              .toList()
          )
          .build()
      );
    auditService.logPersonSearchByIdentityNumber(identityNumber);
    return result;
  }
}
