package fi.oph.otr.onr;

import fi.oph.otr.onr.dto.ContactDetailsGroupDTO;
import fi.oph.otr.onr.dto.PersonalDataDTO;
import fi.oph.otr.onr.model.PersonalData;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang.NotImplementedException;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@RequiredArgsConstructor
public class OnrServiceImpl implements OnrService {

  private final WebClient webClient;

  @Override
  public Map<String, PersonalData> getPersonalDatas(final List<String> onrIds) {
    final PersonalDataDTO[] personalDataDTOS = webClient
      .post()
      .uri("/henkilo/henkilotByHenkiloOidList")
      .contentType(MediaType.APPLICATION_JSON)
      .bodyValue(onrIds)
      .retrieve()
      .bodyToMono(PersonalDataDTO[].class)
      .block();

    final Map<String, PersonalData> personalDatas = new HashMap<>();

    if (personalDataDTOS != null) {
      Arrays
        .stream(personalDataDTOS)
        .forEach(personalDataDTO -> {
          final ContactDetailsGroupDTO contactDetailsGroupDTO = personalDataDTO.contactDetails();

          final PersonalData personalData = PersonalData
            .builder()
            .firstName(personalDataDTO.firstName())
            .lastName(personalDataDTO.lastName())
            .identityNumber(personalDataDTO.identityNumber())
            .email(contactDetailsGroupDTO.email())
            .phoneNumber(contactDetailsGroupDTO.phoneNumber())
            .street(contactDetailsGroupDTO.street())
            .postalCode(contactDetailsGroupDTO.postalCode())
            .town(contactDetailsGroupDTO.town())
            .country(contactDetailsGroupDTO.country())
            .build();

          personalDatas.put(personalDataDTO.onrId(), personalData);
        });
    }

    return personalDatas;
  }

  // TODO: insert personal data in ONR
  @Override
  public String insertPersonalData(final PersonalData personalData) {
    throw new NotImplementedException();
  }

  // TODO: update existing personal data in ONR
  @Override
  public void updatePersonalData(final String onrId, final PersonalData personalData) {
    throw new NotImplementedException();
  }
}
