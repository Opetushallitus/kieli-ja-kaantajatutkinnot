package fi.oph.vkt.api;

import fi.oph.vkt.service.aws.S3Config;
import fi.oph.vkt.util.exception.NotFoundException;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Controller
@RequestMapping(value = "/")
public class IndexController {

  private static final int NONCE_BYTES = 32;
  private final SecureRandom secureRandom = new SecureRandom();

  @Resource
  private S3Config s3Config;

  private void addCSPHeaders(final HttpServletResponse response, final String nonce) {
    final String csp =
      "default-src 'none'; " +
      "script-src 'self' 'nonce-" +
      nonce +
      "' 'strict-dynamic' https: http: 'unsafe-inline'; " +
      "style-src 'self' 'nonce-" +
      nonce +
      "' 'unsafe-inline'; " +
      "connect-src 'self' " +
      s3Config.getBucketURI() +
      "; " +
      "img-src 'self'; " +
      "font-src 'self'; " +
      "base-uri 'self'; " +
      "form-action 'self';";

    response.addHeader("Content-Security-Policy", csp);
  }

  private String getNonce() {
    final byte[] nonceBytes = new byte[NONCE_BYTES];
    secureRandom.nextBytes(nonceBytes);
    return Base64.getEncoder().encodeToString(nonceBytes);
  }

  @GetMapping("")
  public ModelAndView index(final HttpServletResponse response) {
    final String cspNonce = getNonce();
    addCSPHeaders(response, cspNonce);
    return new ModelAndView("index.html", Map.of("cspNonce", cspNonce));
  }

  // Map to everything which has no suffix, i.e. matches to "/foo/bar" but not to "/foo/bar.js"
  @GetMapping(
    path = {
      "{path:[^.]*}",
      "*/{path:[^.]*}",
      "*/*/{path:[^.]*}",
      "*/*/*/{path:[^.]*}",
      "*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/*/*/*/*/*/{path:[^.]*}",
    }
  )
  public ModelAndView indexAllOtherPaths(final HttpServletResponse response) {
    final String cspNonce = getNonce();
    addCSPHeaders(response, cspNonce);
    return new ModelAndView("index.html", Map.of("cspNonce", cspNonce));
  }

  @ExceptionHandler(value = NoResourceFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public NotFoundException handleNoResourceFoundException(final NoResourceFoundException ex) {
    return new NotFoundException("Not found");
  }
}
