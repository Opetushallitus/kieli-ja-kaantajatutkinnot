package fi.oph.akr.util.exception;

import lombok.Getter;
import lombok.NonNull;

@Getter
public class APIException extends RuntimeException {

  private final APIExceptionType exceptionType;

  public APIException(@NonNull final APIExceptionType exceptionType) {
    this.exceptionType = exceptionType;
  }
}
