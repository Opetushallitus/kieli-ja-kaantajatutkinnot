package fi.oph.vkt.scheduled;

import fi.oph.vkt.config.Constants;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.service.ClerkEnrollmentService;
import fi.oph.vkt.util.SchedulingUtil;
import jakarta.annotation.Resource;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CanceledUnfinishedEnrollmentsDestroyer {

  private static final Logger LOG = LoggerFactory.getLogger(CanceledUnfinishedEnrollmentsDestroyer.class);

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1H";

  private static final Duration TTL = Duration.of(24, ChronoUnit.HOURS);

  @Resource
  private final ClerkEnrollmentService clerkEnrollmentService;

  @Resource
  private final EnrollmentRepository enrollmentRepository;

  @Scheduled(cron = Constants.CANCELED_UNFINISHED_ENROLLMENTS_DESTROYER_CRON)
  @SchedulerLock(
    name = "canceledUnfinishedEnrollmentsDestroyer",
    lockAtLeastFor = LOCK_AT_LEAST,
    lockAtMostFor = LOCK_AT_MOST
  )
  public void action() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("canceledUnfinishedEnrollmentsDestroyer");

      enrollmentRepository
        .findAllByStatus(EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT)
        .stream()
        .filter(e -> e.getModifiedAt().plus(TTL).isBefore(LocalDateTime.now()))
        .map(Enrollment::getId)
        .forEach(clerkEnrollmentService::deleteEnrollment);
    });
  }
}
