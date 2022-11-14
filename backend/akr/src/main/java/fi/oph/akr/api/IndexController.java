package fi.oph.akr.api;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
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
    final StringBuilder sb = new StringBuilder();
    sb.append("default-src 'none'; ");

    sb.append("script-src 'self' 'nonce-");
    sb.append(nonce);
    sb.append("' 'strict-dynamic' https: http: 'unsafe-inline'; ");

    sb.append("style-src 'self' 'nonce-");
    sb.append(nonce);
    sb.append("' 'unsafe-inline'; ");

    sb.append("connect-src 'self'; ");
    sb.append("img-src 'self'; ");
    sb.append("font-src 'self'; ");
    sb.append("base-uri 'self'; ");
    sb.append("form-action 'self';");

    response.addHeader("Content-Security-Policy", sb.toString());
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
