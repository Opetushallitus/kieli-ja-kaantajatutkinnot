package fi.oph.otr.onr.mock;

import fi.oph.otr.onr.OnrService;
import fi.oph.otr.onr.model.PersonalData;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class OnrServiceMock implements OnrService {

  public Map<String, PersonalData> getPersonalDatas(final List<String> onrIds) {
    final Map<String, PersonalData> personalDatas = new HashMap<>();
    final PersonalDataFactory personalDataFactory = new PersonalDataFactory();

    onrIds.forEach(onrId -> personalDatas.put(onrId, personalDataFactory.create()));
    return personalDatas;
  }

  public String savePersonalData(final PersonalData personalData) {
    return UUID.randomUUID().toString();
  }

  public void updatePersonalData(final String onrId, final PersonalData personalData) {}
}
