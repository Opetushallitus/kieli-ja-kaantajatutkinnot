package fi.oph.yki.scheduled;

import fi.oph.yki.repository.EmailRepository;
import fi.oph.yki.service.email.EmailService;
import java.util.List;
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

  public static final int BATCH_SIZE = 10;

  private final EmailRepository emailRepository;
  private final EmailService emailService;

  @Scheduled(initialDelayString = "PT10S", fixedDelayString = "PT10S")
  @SchedulerLock(name = "pollEmailsToSend", lockAtLeastFor = "PT1S", lockAtMostFor = "PT1M")
  public void action() {
    LOG.debug("pollEmailsToSend");
    final List<Long> emailsBatch = emailRepository.findEmailsToSend(PageRequest.of(0, BATCH_SIZE));
    LOG.debug("Emails batch size: {}", emailsBatch.size());
    emailsBatch.forEach(emailService::sendEmail);
  }
}
