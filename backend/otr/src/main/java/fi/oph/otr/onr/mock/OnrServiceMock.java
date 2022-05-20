package fi.oph.otr.onr.mock;

import fi.oph.otr.onr.OnrService;
import fi.oph.otr.onr.model.PersonalData;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class OnrServiceMock implements OnrService {

  public Map<String, PersonalData> getPersonalDatas(final List<String> onrIds) {
    final Map<String, PersonalData> personalDatas = new HashMap<>();
    final PersonalDataFactory factory = new PersonalDataFactory();

    onrIds.forEach(onrId -> personalDatas.put(onrId, factory.createPersonalData()));
    return personalDatas;
  }
}
