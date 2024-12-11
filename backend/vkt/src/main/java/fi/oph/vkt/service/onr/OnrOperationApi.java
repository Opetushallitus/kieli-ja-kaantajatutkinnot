package fi.oph.vkt.service.onr;

import java.util.List;
import java.util.Map;

public interface OnrOperationApi {
  Map<String, PersonalData> fetchPersonalDatas(List<String> onrIds) throws Exception;
}
