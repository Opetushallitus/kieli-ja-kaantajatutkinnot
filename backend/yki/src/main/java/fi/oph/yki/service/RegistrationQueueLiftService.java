package fi.oph.yki.service;

import fi.oph.yki.model.Registration;
import fi.oph.yki.model.RegistrationChangeEvent;
import fi.oph.yki.repository.LiftedRegistration;
import fi.oph.yki.repository.RegistrationChangeEventRepository;
import fi.oph.yki.repository.RegistrationRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrationQueueLiftService {

  private static final Logger LOG = LoggerFactory.getLogger(RegistrationQueueLiftService.class);

  public enum Outcome {
    LIFTED,
    NOTHING_TO_LIFT,
    SESSION_LOCKED,
  }

  private final RegistrationRepository registrationRepository;
  private final RegistrationChangeEventRepository registrationChangeEventRepository;
  private final RegistrationEmailService registrationEmailService;

  /**
   * Lifts at most one registration from an exam session's queue. The session lock, the lift, its
   * change event and its email share one transaction, so a failure in any of them undoes the lift.
   */
  @Transactional
  public Outcome liftNext(final long examSessionId) {
    if (!registrationRepository.tryLockExamSessionForQueueLift(examSessionId)) {
      return Outcome.SESSION_LOCKED;
    }

    final Optional<LiftedRegistration> lifted = registrationRepository.liftNextFromQueue(examSessionId);
    if (lifted.isEmpty()) {
      return Outcome.NOTHING_TO_LIFT;
    }

    insertChangeEvent(lifted.get());

    final Registration registration = registrationRepository.getReferenceById(lifted.get().id());
    if (lifted.get().freeRegistration()) {
      registrationEmailService.sendLiftedFromQueueForFreeEmail(registration);
    } else {
      registrationEmailService.sendLiftedFromQueueEmail(registration);
    }

    LOG.info(
      "Lifted registration {} ({}) from the queue of exam session {}",
      lifted.get().id(),
      lifted.get().partialExamType(),
      examSessionId
    );
    return Outcome.LIFTED;
  }

  // Legacy writes the event from the post-update row, so kind is ADMISSION. The still-Clojure
  // statistics job depends on that: a LIFT_FROM_QUEUE event with kind QUEUE would drift the counts.
  private void insertChangeEvent(final LiftedRegistration lifted) {
    final RegistrationChangeEvent changeEvent = new RegistrationChangeEvent();
    changeEvent.setEvent("LIFT_FROM_QUEUE");
    changeEvent.setRegistrationId(lifted.id());
    changeEvent.setExamSessionId(lifted.examSessionId());
    changeEvent.setRegistrationState(lifted.state());
    changeEvent.setRegistrationKind(lifted.kind());
    changeEvent.setOriginalExamSessionId(lifted.originalExamSessionId());
    changeEvent.setCreatedAt(LocalDateTime.now());
    changeEvent.setAuthorType("AUTOMATION");
    registrationChangeEventRepository.saveAndFlush(changeEvent);
  }
}
