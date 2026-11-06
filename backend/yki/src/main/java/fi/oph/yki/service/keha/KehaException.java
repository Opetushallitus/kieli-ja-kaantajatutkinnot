package fi.oph.yki.service.keha;

import lombok.Getter;

/**
 * The message is a short detail without personal data (e.g. "HTTP 503", "timeout"), so that it can be written
 * to the audit log.
 */
@Getter
public class KehaException extends RuntimeException {

  private final boolean retryable;

  public KehaException(final String message, final boolean retryable) {
    super(message);
    this.retryable = retryable;
  }

  public KehaException(final String message, final boolean retryable, final Throwable cause) {
    super(message, cause);
    this.retryable = retryable;
  }
}
