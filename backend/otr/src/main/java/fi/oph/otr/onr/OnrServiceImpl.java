package fi.oph.otr.onr;

import fi.oph.otr.onr.model.PersonalData;
import java.util.List;
import java.util.Map;

public class OnrServiceImpl implements OnrService {

  // TODO: implement
  public Map<String, PersonalData> getPersonalDatas(final List<String> onrIds) {
    return Map.of();
  }

  // TODO: insert new or update existing personal data in ONR based on identityNumber in `personalData`
  public String savePersonalData(final PersonalData personalData) {
    return "";
  }

  // TODO: update existing personal data in ONR
  public void updatePersonalData(final String onrId, final PersonalData personalData) {}
}
