package fi.oph.otr.config;

import fi.oph.otr.util.exception.APIException;
import fi.oph.otr.util.exception.APIExceptionType;
import fi.oph.otr.util.exception.NotFoundException;
import java.util.Set;
import javax.validation.ConstraintViolationException;
import net.minidev.json.JSONObject;
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

  @ExceptionHandler(APIException.class)
  public ResponseEntity<Object> handleAPIException(final APIException ex) {
    LOG.error("APIException: " + ex.getExceptionType());
    return badRequest(ex.getExceptionType());
  }

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<Object> handleNotFoundException(final NotFoundException ex) {
    LOG.error("NotFoundException: " + ex.getMessage());
    return notFound();
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

  private ResponseEntity<Object> badRequest(final APIExceptionType exceptionType) {
    final JSONObject data = new JSONObject();
    data.put("errorCode", exceptionType.getCode());

    return new ResponseEntity<>(data, HttpStatus.BAD_REQUEST);
  }

  private ResponseEntity<Object> notFound() {
    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
  }

  private ResponseEntity<Object> internalServerError() {
    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
