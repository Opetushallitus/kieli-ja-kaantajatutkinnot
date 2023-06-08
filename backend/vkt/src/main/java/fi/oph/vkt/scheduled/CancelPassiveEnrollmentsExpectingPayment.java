package fi.oph.vkt.scheduled;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.util.SchedulingUtil;
import jakarta.annotation.Resource;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CancelPassiveEnrollmentsExpectingPayment {

  private static final Logger LOG = LoggerFactory.getLogger(CancelPassiveEnrollmentsExpectingPayment.class);

  private static final String INITIAL_DELAY = "PT5S";

  private static final String FIXED_DELAY = "PT30M";

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1M";

  private static final Duration PAYMENT_TIME = Duration.of(3, ChronoUnit.HOURS);

  @Resource
  private final EnrollmentRepository enrollmentRepository;

  @Scheduled(initialDelayString = INITIAL_DELAY, fixedDelayString = FIXED_DELAY)
  @SchedulerLock(
    name = "cancelPassiveEnrollmentsExpectingPayment",
    lockAtLeastFor = LOCK_AT_LEAST,
    lockAtMostFor = LOCK_AT_MOST
  )
  public void action() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("cancelPassiveEnrollmentsExpectingPayment");

      final List<Enrollment> enrollmentsToCancel = enrollmentRepository
        .findAllByStatus(EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT)
        .stream()
        .filter(e -> e.getModifiedAt().plus(PAYMENT_TIME).isBefore(LocalDateTime.now()))
        .toList();

      enrollmentsToCancel.forEach(e -> {
        e.setStatus(EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT);
        enrollmentRepository.saveAndFlush(e);
      });
    });
  }
}
