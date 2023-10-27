package fi.oph.akr.util.exception;

import lombok.NonNull;

public class NotFoundException extends RuntimeException {

  public NotFoundException(@NonNull final String msg) {
    super(msg);
  }
}
