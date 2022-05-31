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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@RequiredArgsConstructor
public class OnrServiceImpl implements OnrService {

  private static final Logger LOG = LoggerFactory.getLogger(OnrServiceImpl.class);

  private final WebClient webClient;

  @Override
  public Map<String, PersonalData> getPersonalDatas(final List<String> onrIds) {
    LOG.warn(onrIds.get(0));

    final PersonalDataDTO[] personalDataDTOS = webClient
      .post()
      .uri("/henkilo/henkilotByHenkiloOidList")
      .contentType(MediaType.APPLICATION_JSON)
      .bodyValue(onrIds)
      .retrieve()
      .bodyToMono(PersonalDataDTO[].class)
      .block();

    if (personalDataDTOS == null || personalDataDTOS[0] == null) {
      LOG.warn("No PersonalDataDTOs returned");
    }

    final Map<String, PersonalData> personalDatas = new HashMap<>();

    if (personalDataDTOS != null) {
      Arrays
        .stream(personalDataDTOS)
        .forEach(personalDataDTO -> {
          LOG.warn(personalDataDTO.onrId());
          LOG.warn(personalDataDTO.firstName());
          LOG.warn(personalDataDTO.lastName());
          final List<ContactDetailsGroupDTO> groups = personalDataDTO.contactDetailsGroups();

          final PersonalData personalData = PersonalData
            .builder()
            .firstName(personalDataDTO.firstName())
            .lastName(personalDataDTO.lastName())
            .identityNumber(personalDataDTO.identityNumber())
            .email(ContactDetailsUtil.getPrimaryEmail(groups))
            .phoneNumber(ContactDetailsUtil.getPrimaryPhoneNumber(groups))
            .street(ContactDetailsUtil.getPrimaryStreet(groups))
            .postalCode(ContactDetailsUtil.getPrimaryPostalCode(groups))
            .town(ContactDetailsUtil.getPrimaryTown(groups))
            .country(ContactDetailsUtil.getPrimaryCountry(groups))
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
