package fi.oph.vkt.service.onr.mock;

import fi.oph.vkt.service.onr.OnrOperationApi;
import fi.oph.vkt.service.onr.PersonalData;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class MockOnrOperationApiImpl implements OnrOperationApi {

  @Override
  public Map<String, PersonalData> fetchPersonalDatas(final List<String> onrIds) {
    final PersonalDataFactory personalDataFactory = new PersonalDataFactory();
    return onrIds.stream().collect(Collectors.toMap(Function.identity(), personalDataFactory::create));
  }
}
