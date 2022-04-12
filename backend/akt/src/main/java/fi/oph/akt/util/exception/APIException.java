package fi.oph.akt.util.exception;

import lombok.Getter;
import lombok.NonNull;

@Getter
public class APIException extends RuntimeException {

  private final APIExceptionType exceptionType;

  public APIException(@NonNull APIExceptionType exceptionType) {
    this.exceptionType = exceptionType;
  }
}
