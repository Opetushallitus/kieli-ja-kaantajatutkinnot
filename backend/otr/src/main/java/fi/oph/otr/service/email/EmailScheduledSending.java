package fi.oph.otr.service.email;

import fi.oph.otr.repository.EmailRepository;
import fi.oph.otr.util.SchedulingUtil;
import java.util.List;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailScheduledSending {

  private static final Logger LOG = LoggerFactory.getLogger(EmailScheduledSending.class);

  private static final String INITIAL_DELAY = "PT10S";

  private static final String FIXED_DELAY = "PT1H";

  private static final String LOCK_AT_LEAST = "PT0S";

  private static final String LOCK_AT_MOST = "PT1M";

  public static final int BATCH_SIZE = 10;

  @Resource
  private final EmailRepository emailRepository;

  @Resource
  private final EmailService emailService;

  @Scheduled(initialDelayString = INITIAL_DELAY, fixedDelayString = FIXED_DELAY)
  @SchedulerLock(name = "pollEmailsToSend", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void pollEmailsToSend() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("pollEmailsToSend");
      final List<Long> emailsBatch = emailRepository.findEmailsToSend(PageRequest.of(0, BATCH_SIZE));
      LOG.debug("sending emailsBatch size {}", emailsBatch.size());
      emailsBatch.forEach(emailService::sendEmail);
    });
  }
}
