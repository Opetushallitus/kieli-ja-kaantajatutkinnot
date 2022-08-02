package fi.oph.otr.onr;

import fi.oph.otr.onr.model.PersonalData;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OnrService {

  private static final Logger LOG = LoggerFactory.getLogger(OnrService.class);

  private Map<String, PersonalData> personalDataCache = new HashMap<>();

  @Resource
  private final OnrOperationApi api;

  public void updateCache(final List<String> onrIds) {
    try {
      personalDataCache = api.fetchPersonalDatas(onrIds);
    } catch (final Exception e) {
      LOG.error("Updating personal data cache failed", e);
    }
  }

  public Map<String, PersonalData> getCachedPersonalDatas() {
    return Collections.unmodifiableMap(personalDataCache);
  }

  public Optional<PersonalData> findPersonalDataByIdentityNumber(final String identityNumber) throws Exception {
    return api.findPersonalDataByIdentityNumber(identityNumber);
  }

  public String insertPersonalData(final PersonalData data) throws Exception {
    final PersonalData personalData = PersonalData
      .builder()
      .individualised(false)
      .lastName(data.getLastName())
      .firstName(data.getFirstName())
      .nickName(data.getNickName())
      .identityNumber(data.getIdentityNumber())
      .email(data.getEmail())
      .phoneNumber(data.getPhoneNumber())
      .street(data.getStreet())
      .postalCode(data.getPostalCode())
      .town(data.getTown())
      .country(data.getCountry())
      .build();

    final String onrId = api.insertPersonalData(personalData);

    personalData.setOnrId(onrId);
    personalDataCache.put(onrId, personalData);
    return onrId;
  }

  public void updatePersonalData(final PersonalData personalData) throws Exception {
    personalData.assertOnrUpdatePossible();
    api.updatePersonalData(personalData);
    personalDataCache.put(personalData.getOnrId(), personalData);
  }
}
