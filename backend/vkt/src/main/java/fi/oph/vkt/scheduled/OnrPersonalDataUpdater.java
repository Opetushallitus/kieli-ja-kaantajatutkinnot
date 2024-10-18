package fi.oph.vkt.scheduled;

import fi.oph.vkt.service.ExaminerDetailsService;
import fi.oph.vkt.util.SchedulingUtil;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OnrPersonalDataUpdater {

  private static final Logger LOG = LoggerFactory.getLogger(OnrPersonalDataUpdater.class);
  private static final String INITIAL_DELAY = "PT0S";
  private static final String FIXED_DELAY = "PT5M";
  private static final String LOCK_AT_LEAST = "PT0S";
  private static final String LOCK_AT_MOST = "PT3M";

  @Resource
  private final ExaminerDetailsService examinerDetailsService;

  @Scheduled(initialDelayString = INITIAL_DELAY, fixedDelayString = FIXED_DELAY)
  @SchedulerLock(name = "updatePersonalDataFromOnr", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void updateOnrCache() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("updatePersonalDataFromOnr");
      examinerDetailsService.updateStoredPersonalData();
    });
  }
}
