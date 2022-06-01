package fi.oph.otr.onr;

import fi.oph.otr.onr.dto.ContactDetailsGroupDTO;
import fi.oph.otr.onr.dto.PersonalDataDTO;
import fi.oph.otr.onr.model.PersonalData;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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
  public Optional<PersonalData> findPersonalDataByIdentityNumber(final String identityNumber) {
    LOG.warn(identityNumber);

    final PersonalDataDTO personalDataDTO = webClient
      .get()
      .uri("/henkilo/hetu=" + identityNumber)
      .retrieve()
      .bodyToMono(PersonalDataDTO.class)
      .block();

    if (personalDataDTO != null) {
      return Optional.of(createPersonalData(personalDataDTO));
    }

    LOG.warn("No PersonalDataDTO returned");
    return Optional.empty();
  }

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
        .filter(Objects::nonNull)
        .forEach(personalDataDTO -> {
          personalDatas.put(personalDataDTO.onrId(), createPersonalData(personalDataDTO));
        });
    }

    return personalDatas;
  }

  private PersonalData createPersonalData(final PersonalDataDTO personalDataDTO) {
    LOG.warn(personalDataDTO.onrId());
    LOG.warn(personalDataDTO.lastName());
    LOG.warn(personalDataDTO.firstName());

    final List<ContactDetailsGroupDTO> groups = personalDataDTO.contactDetailsGroups();

    return PersonalData
      .builder()
      .lastName(personalDataDTO.lastName())
      .firstName(personalDataDTO.firstName())
      .nickName(personalDataDTO.nickName())
      .identityNumber(personalDataDTO.identityNumber())
      .email(ContactDetailsUtil.getPrimaryEmail(groups))
      .phoneNumber(ContactDetailsUtil.getPrimaryPhoneNumber(groups))
      .street(ContactDetailsUtil.getPrimaryStreet(groups))
      .postalCode(ContactDetailsUtil.getPrimaryPostalCode(groups))
      .town(ContactDetailsUtil.getPrimaryTown(groups))
      .country(ContactDetailsUtil.getPrimaryCountry(groups))
      .isIndividualised(personalDataDTO.isIndividualised())
      .build();
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
