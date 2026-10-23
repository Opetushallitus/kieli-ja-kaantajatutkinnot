package fi.oph.yki.service.keha;

import java.util.UUID;

public interface KehaClient {
  /**
   * Throws on any failure (connection, timeout, unexpected response), so that callers can keep
   * "not eligible" and "check failed" apart.
   */
  KehaDecision checkEligibility(String ssn, UUID personUuid);
}
