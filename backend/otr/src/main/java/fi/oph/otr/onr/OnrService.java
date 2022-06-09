package fi.oph.otr.onr;

import fi.oph.otr.onr.model.PersonalData;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OnrService {

  private Map<String, PersonalData> personalDataCache = new HashMap<>();

  @Resource
  private final OnrOperationApi api;

  public void updateCache(final List<String> onrIds) {
    personalDataCache = api.fetchPersonalDatas(onrIds);
  }

  public Map<String, PersonalData> getCachedPersonalDatas() {
    return Collections.unmodifiableMap(personalDataCache);
  }

  public String insertPersonalData(final PersonalData personalData) {
    final String onrId = api.insertPersonalData(personalData);
    personalDataCache.put(onrId, personalData);
    return onrId;
  }

  public void updatePersonalData(final String onrId, final PersonalData personalData) {
    api.updatePersonalData(onrId, personalData);
    personalDataCache.put(onrId, personalData);
  }
}
