package fi.oph.yki.service.keha;

import java.util.UUID;

public interface KehaClient {
  /**
   * Throws on any failure (connection, timeout, unexpected response), so that callers can keep
   * "not eligible" and "check failed" apart.
   *
   * @param correlationId sent to KEHA so that a single check can be found in both their logs and our audit log
   */
  KehaDecision checkEligibility(String ssn, UUID personUuid, UUID correlationId);
}
