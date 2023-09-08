package fi.oph.akr.scheduled;

import fi.oph.akr.onr.OnrService;
import fi.oph.akr.repository.TranslatorRepository;
import fi.oph.akr.util.SchedulingUtil;
import jakarta.annotation.Resource;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OnrCacheUpdater {

  private static final Logger LOG = LoggerFactory.getLogger(OnrCacheUpdater.class);

  private static final String INITIAL_DELAY = "PT0S";

  private static final String FIXED_DELAY = "PT5M";

  private static final String LOCK_AT_LEAST = "PT0S";

  private static final String LOCK_AT_MOST = "PT3M";

  @Resource
  private final TranslatorRepository translatorRepository;

  @Resource
  private final OnrService onrService;

  @Scheduled(initialDelayString = INITIAL_DELAY, fixedDelayString = FIXED_DELAY)
  @SchedulerLock(name = "updateOnrCache", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void updateOnrCache() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("updateOnrCache");
      final List<String> onrIds = translatorRepository.listExistingOnrIds();
      onrService.updateCache(onrIds);
    });
  }
}
