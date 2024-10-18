package fi.oph.vkt.service.onr.mock;

import fi.oph.vkt.service.onr.OnrOperationApi;
import fi.oph.vkt.service.onr.PersonalData;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class MockOnrOperationApiImpl implements OnrOperationApi {

  // Cache personal data in a cache to try and ensure we return the same data per oid
  // at least during the lifetime of the current JVM process
  final Map<String, PersonalData> personalDataCache = new HashMap<>();
  final PersonalDataFactory personalDataFactory = new PersonalDataFactory();

  @Override
  public Map<String, PersonalData> fetchPersonalDatas(final List<String> onrIds) {
    HashMap<String, PersonalData> datas = new HashMap<>();
    for (String onrId : onrIds) {
      if (!personalDataCache.containsKey(onrId)) {
        personalDataCache.put(onrId, personalDataFactory.create(onrId));
      }
      datas.put(onrId, personalDataCache.get(onrId));
    }
    return datas;
  }
}
