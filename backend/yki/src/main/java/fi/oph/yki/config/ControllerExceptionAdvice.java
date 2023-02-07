package fi.oph.yki.config;

import java.util.Set;
import javax.validation.ConstraintViolationException;
import org.apache.catalina.connector.ClientAbortException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Order(value = Ordered.HIGHEST_PRECEDENCE)
@ControllerAdvice
public class ControllerExceptionAdvice {

  private static final Logger LOG = LoggerFactory.getLogger(ControllerExceptionAdvice.class);

  private static final Set<String> GENERIC_BAD_REQUESTS = Set.of(
    ConstraintViolationException.class.getSimpleName(),
    HttpMessageNotReadableException.class.getSimpleName(),
    IllegalArgumentException.class.getSimpleName(),
    MethodArgumentNotValidException.class.getSimpleName(),
    MissingServletRequestParameterException.class.getSimpleName()
  );

  @ExceptionHandler(ClientAbortException.class)
  public void handleClientAbortException(final ClientAbortException ex) {
    final String message = ex.getMessage();
    if (!message.endsWith("Broken pipe") && !message.endsWith("Connection reset by peer")) {
      LOG.error("ClientAbortException: " + message);
    }
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Object> handleRest(final Exception ex) {
    final String exceptionClassName = ex.getClass().getSimpleName();

    if (GENERIC_BAD_REQUESTS.contains(exceptionClassName)) {
      LOG.error(exceptionClassName + ": " + ex.getMessage());
      return badRequest();
    } else {
      LOG.error("Exception caught", ex);
      return internalServerError();
    }
  }

  private ResponseEntity<Object> badRequest() {
    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
  }

  private ResponseEntity<Object> internalServerError() {
    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
