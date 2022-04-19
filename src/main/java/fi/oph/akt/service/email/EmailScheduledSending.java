package fi.oph.akt.service.email;

import fi.oph.akt.repository.EmailRepository;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EmailScheduledSending {

	private static final Logger LOG = LoggerFactory.getLogger(EmailScheduledSending.class);

	private static final String FIXED_DELAY = "PT10S";

	private static final String INITIAL_DELAY = "PT10S";

	private static final String LOCK_AT_LEAST = "PT10S";

	private static final String LOCK_AT_MOST = "PT2H";

	public static final int BATCH_SIZE = 10;

	@Resource
	private final EmailRepository emailRepository;

	@Resource
	private final EmailService emailService;

	@Scheduled(fixedDelayString = FIXED_DELAY, initialDelayString = INITIAL_DELAY)
	@SchedulerLock(name = "pollEmailsToSend", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
	public void pollEmailsToSend() {
		LOG.debug("pollEmailsToSend");
		final List<Long> emailsBatch = emailRepository.findEmailsToSend(PageRequest.of(0, BATCH_SIZE));
		LOG.debug("sending emailsBatch size {}", emailsBatch.size());
		emailsBatch.forEach(emailService::sendEmail);
	}

}
