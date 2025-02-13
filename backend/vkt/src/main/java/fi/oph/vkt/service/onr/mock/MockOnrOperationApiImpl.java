package fi.oph.vkt.service.onr.mock;

import fi.oph.vkt.service.onr.OnrOperationApi;
import fi.oph.vkt.service.onr.PersonalData;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MockOnrOperationApiImpl implements OnrOperationApi {

  int oidIncrement = 1;

  // Cache personal data in a cache to try and ensure we return the same data per oid
  // at least during the lifetime of the current JVM process
  final Map<String, PersonalData> personalDataCache = new HashMap<>();
  final PersonalDataFactory personalDataFactory = new PersonalDataFactory();

  @Override
  public Map<String, PersonalData> fetchPersonalDatas(final List<String> onrIds) {
    final HashMap<String, PersonalData> datas = new HashMap<>();
    for (final String onrId : onrIds) {
      if (!personalDataCache.containsKey(onrId)) {
        personalDataCache.put(onrId, personalDataFactory.create(onrId));
      }
      datas.put(onrId, personalDataCache.get(onrId));
    }
    return datas;
  }

  @Override
  public String insertPersonalData(final PersonalData personalData) {
    return "1.2.246.562.10.1000000000" + oidIncrement++;
  }
}
