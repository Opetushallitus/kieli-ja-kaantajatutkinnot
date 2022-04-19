package fi.oph.akt.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Order(value = Ordered.HIGHEST_PRECEDENCE)
@ControllerAdvice
public class ControllerExceptionAdvice {

	private static final Logger LOG = LoggerFactory.getLogger(ControllerExceptionAdvice.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Object> handleMethodArgumentNotValidException(final MethodArgumentNotValidException ex) {
		LOG.error("MethodArgumentNotValidException: " + ex.getMessage());

		return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Object> handleIllegalArgumentException(final IllegalArgumentException ex) {
		LOG.error("IllegalArgumentException: " + ex.getMessage());

		return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<Object> handleHttpMessageNotReadableException(final HttpMessageNotReadableException ex) {
		LOG.error("HttpMessageNotReadableException: " + ex.getMessage());

		return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleAll(final Exception ex) {
		LOG.error("Exception caught", ex);

		return new ResponseEntity<>("exception: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

}
