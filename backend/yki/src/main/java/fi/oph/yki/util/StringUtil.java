package fi.oph.yki.util;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.apache.commons.codec.digest.DigestUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;

public class StringUtil {

  public static String sha256hex(final String str) {
    return DigestUtils.sha256Hex(str);
  }

  public static Map<String, String> splitAuth(final String authStr) {
    if (authStr == null) {
      return null;
    }

    final String[] auth = authStr.split(":", 2);

    return Map.of("user", auth[0], "password", auth[1]);
  }

  public static String getOidFromRequest(final HttpServletRequest request) {
    final String authorization = request.getHeader("Authorization");
    final Map<String, String> auth = StringUtil.splitAuth(authorization);

    return auth == null ? null : auth.get("user");
  }

  public static String sanitize(final String nullable) {
    return nullable == null
      ? null
      : Jsoup
        .clean(nullable, "", Safelist.none(), new Document.OutputSettings().prettyPrint(false))
        .trim()
        .replaceAll("^=*", "");
  }
}
