package fi.oph.otr.onr;

import fi.oph.otr.onr.model.PersonalData;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.NotImplementedException;

public class OnrOperationApiImpl implements OnrOperationApi {

  // TODO: implement
  @Override
  public Map<String, PersonalData> fetchPersonalDatas(final List<String> onrIds) {
    throw new NotImplementedException();
  }

  // TODO: insert personal data in ONR
  @Override
  public String insertPersonalData(final PersonalData personalData) {
    throw new NotImplementedException();
  }

  // TODO: update existing personal data in ONR
  @Override
  public void updatePersonalData(final String onrId, final PersonalData personalData) {
    throw new NotImplementedException();
  }
}
