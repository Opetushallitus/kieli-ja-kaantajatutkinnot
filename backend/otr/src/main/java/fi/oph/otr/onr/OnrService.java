package fi.oph.otr.onr;

import fi.oph.otr.onr.model.PersonalData;
import java.util.List;
import java.util.Map;

public interface OnrService {
  Map<String, PersonalData> getPersonalDatas(List<String> onrIds);

  String insertPersonalData(PersonalData personalData);

  void updatePersonalData(String onrId, PersonalData personalData);
}
