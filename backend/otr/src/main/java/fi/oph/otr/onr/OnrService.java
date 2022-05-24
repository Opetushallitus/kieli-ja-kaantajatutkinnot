package fi.oph.otr.onr;

import fi.oph.otr.onr.model.PersonalData;
import java.util.List;
import java.util.Map;

public interface OnrService {
  Map<String, PersonalData> getPersonalDatas(final List<String> onrIds);
}
