package fi.oph.vkt.util.exception;

import lombok.NonNull;

public class NotFoundException extends RuntimeException {

  public NotFoundException(@NonNull String msg) {
    super(msg);
  }
}
