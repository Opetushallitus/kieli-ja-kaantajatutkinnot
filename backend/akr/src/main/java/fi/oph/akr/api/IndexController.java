package fi.oph.akr.api;

import jakarta.servlet.http.HttpServletResponse;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping(value = "/")
public class IndexController {

  private static final int NONCE_BYTES = 32;
  private final SecureRandom secureRandom = new SecureRandom();

  private static void addCSPHeaders(final HttpServletResponse response, final String nonce) {
    final String csp =
      "default-src 'none'; " +
      "script-src 'self' 'nonce-" +
      nonce +
      "' 'strict-dynamic' https: http: 'unsafe-inline'; " +
      "style-src 'self' 'nonce-" +
      nonce +
      "' 'unsafe-inline'; " +
      "connect-src 'self'; " +
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
}
