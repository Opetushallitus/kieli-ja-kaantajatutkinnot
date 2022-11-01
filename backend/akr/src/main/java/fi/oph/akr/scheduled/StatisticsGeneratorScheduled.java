package fi.oph.akr.scheduled;

import fi.oph.akr.service.StatisticsService;
import fi.oph.akr.util.SchedulingUtil;
import javax.annotation.Resource;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class StatisticsGeneratorScheduled {

  private static final Logger LOG = LoggerFactory.getLogger(StatisticsGeneratorScheduled.class);

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1H";

  @Resource
  private StatisticsService statisticsService;

  @Scheduled(cron = "0 29 8 * * *")
  @SchedulerLock(name = "generateStatistics", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void generateStatistics() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.info("Generating statistics");

      statisticsService.generateContactRequestStatistics();
      statisticsService.generateEmailStatistics();
    });
  }
}
