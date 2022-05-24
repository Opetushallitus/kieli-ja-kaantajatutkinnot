package fi.oph.otr.onr;

import fi.oph.otr.onr.model.PersonalData;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.NotImplementedException;

public class OnrServiceImpl implements OnrService {

  // TODO: implement
  public Map<String, PersonalData> getPersonalDatas(final List<String> onrIds) {
    throw new NotImplementedException();
  }

  // TODO: insert personal data in ONR
  public String insertPersonalData(final PersonalData personalData) {
    throw new NotImplementedException();
  }

  // TODO: update existing personal data in ONR
  public void updatePersonalData(final String onrId, final PersonalData personalData) {
    throw new NotImplementedException();
  }
}
