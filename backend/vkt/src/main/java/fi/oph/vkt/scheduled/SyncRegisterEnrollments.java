package fi.oph.vkt.scheduled;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.vkt.service.RegisterEnrollmentService;
import fi.oph.vkt.util.SchedulingUtil;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(value = "app.register.sync-enabled", havingValue = "true")
public class SyncRegisterEnrollments {

  private static final Logger LOG = LoggerFactory.getLogger(SyncRegisterEnrollments.class);

  private static final String INITIAL_DELAY = "PT5M";

  private static final String FIXED_DELAY = "PT60M";

  private static final String LOCK_AT_LEAST = "PT20M";

  private static final String LOCK_AT_MOST = "PT40M";

  @Resource
  private RegisterEnrollmentService registerEnrollmentService;

  @Scheduled(initialDelayString = INITIAL_DELAY, fixedDelayString = FIXED_DELAY)
  @SchedulerLock(name = "syncRegisterEnrollments", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void action() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.info("sync register enrollments");
      try {
        registerEnrollmentService.sync();
      } catch (final JsonProcessingException e) {
        throw new RuntimeException(e);
      }
    });
  }
}
