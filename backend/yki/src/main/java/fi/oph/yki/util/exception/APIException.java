package fi.oph.yki.util.exception;

import lombok.NonNull;

public class APIException extends RuntimeException {

  private final APIExceptionType exceptionType;

  public APIException(@NonNull APIExceptionType exceptionType) {
    super(exceptionType.name());
    this.exceptionType = exceptionType;
  }
}
