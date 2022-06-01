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

  public Optional<PersonDTO> findPersonByIdentityNumber(final String identityNumber) {
    return onrService
      .findPersonalDataByIdentityNumber(identityNumber)
      .map(personalData ->
        PersonDTO
          .builder()
          .lastName(personalData.lastName())
          .firstName(personalData.firstName())
          .nickName(personalData.nickName())
          .identityNumber(personalData.identityNumber())
          .street(personalData.street())
          .postalCode(personalData.postalCode())
          .town(personalData.town())
          .country(personalData.country())
          .isIndividualised(personalData.isIndividualised())
          .build()
      );
  }
}
