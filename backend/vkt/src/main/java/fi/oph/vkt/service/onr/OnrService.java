package fi.oph.vkt.service.onr;

import jakarta.annotation.Resource;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OnrService {

  private static final Logger LOG = LoggerFactory.getLogger(OnrService.class);

  @Resource
  private final OnrOperationApi api;

  public Map<String, PersonalData> getOnrPersonalData(final List<String> onrIds) {
    try {
      return api.fetchPersonalDatas(onrIds);
    } catch (final Exception e) {
      LOG.error("Fetching personal data from ONR failed", e);
      return Map.of();
    }
  }
}
