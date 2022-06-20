package fi.oph.otr.service;

import fi.oph.otr.api.dto.clerk.PersonDTO;
import fi.oph.otr.onr.OnrService;
import java.util.Optional;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PersonService {

  @Resource
  private final OnrService onrService;

  public Optional<PersonDTO> findPersonByIdentityNumber(final String identityNumber) throws Exception {
    return onrService
      .findPersonalDataByIdentityNumber(identityNumber)
      .map(personalData ->
        PersonDTO
          .builder()
          .onrId(personalData.getOnrId())
          .isIndividualised(personalData.getIndividualised())
          .identityNumber(personalData.getIdentityNumber())
          .lastName(personalData.getLastName())
          .firstName(personalData.getFirstName())
          .nickName(personalData.getNickName())
          .street(personalData.getStreet())
          .postalCode(personalData.getPostalCode())
          .town(personalData.getTown())
          .country(personalData.getCountry())
          .build()
      );
  }
}
