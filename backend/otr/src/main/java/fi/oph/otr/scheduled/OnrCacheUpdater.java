package fi.oph.otr.scheduled;

import fi.oph.otr.onr.OnrService;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.util.SchedulingUtil;
import java.util.List;
import javax.annotation.Resource;
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
  private final InterpreterRepository interpreterRepository;

  @Resource
  private final OnrService onrService;

  @Scheduled(initialDelayString = INITIAL_DELAY, fixedDelayString = FIXED_DELAY)
  @SchedulerLock(name = "updateOnrCache", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void updateOnrCache() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("updateOnrCache");
      final List<String> onrIds = interpreterRepository.listExistingOnrIds();
      onrService.updateCache(onrIds);
    });
  }
}
