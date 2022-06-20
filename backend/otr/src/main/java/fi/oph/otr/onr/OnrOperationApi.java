package fi.oph.otr.onr;

import fi.oph.otr.onr.model.PersonalData;
import java.util.List;
import java.util.Map;

public interface OnrOperationApi {
  Map<String, PersonalData> fetchPersonalDatas(List<String> onrIds) throws Exception;

  String insertPersonalData(PersonalData personalData);

  void updatePersonalData(String onrId, PersonalData personalData);
}
