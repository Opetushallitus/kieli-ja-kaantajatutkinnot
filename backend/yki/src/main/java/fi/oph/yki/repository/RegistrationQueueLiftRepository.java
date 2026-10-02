package fi.oph.yki.repository;

import java.util.Optional;

/**
 * Native statements for lifting queued registrations. Kept apart from {@link RegistrationRepository}'s
 * query methods because Spring Data cannot return rows from a modifying query, and the lift needs its
 * UPDATE's RETURNING.
 */
public interface RegistrationQueueLiftRepository {
  /**
   * Takes the transaction-scoped advisory lock that serializes queue lifts for one exam session.
   *
   * <p>Must be called inside a transaction and as a separate statement before
   * {@link #liftNextFromQueue}: under READ COMMITTED the lift then takes its snapshot after any
   * competing lift has committed, which is what makes its capacity check authoritative. Released
   * automatically when the transaction ends.
   *
   * @return false if another transaction holds the lock
   */
  boolean tryLockExamSessionForQueueLift(long examSessionId);

  /**
   * Moves the oldest queued, submitted registration that the session's type allows to be lifted to
   * ADMISSION, if the pool it competes in still has a free place.
   *
   * @return the registration after the update, or empty if nothing could be lifted
   */
  Optional<LiftedRegistration> liftNextFromQueue(long examSessionId);
}
