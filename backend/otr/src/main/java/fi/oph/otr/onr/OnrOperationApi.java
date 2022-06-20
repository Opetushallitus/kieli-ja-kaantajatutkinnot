package fi.oph.otr.onr;

import fi.oph.otr.onr.model.PersonalData;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface OnrOperationApi {
  Map<String, PersonalData> fetchPersonalDatas(List<String> onrIds) throws Exception;

  Optional<PersonalData> findPersonalDataByIdentityNumber(String identityNumber) throws Exception;

  String insertPersonalData(PersonalData personalData);

  void updatePersonalData(PersonalData personalData);
}
