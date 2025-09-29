package fi.oph.yki.util;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.codec.digest.DigestUtils;

public class StringUtil {

  public static String sha256hex(final String str) {
    return DigestUtils.sha256Hex(str);
  }

  public static Map<String, String> splitAuth(final String authStr) {
    final String[] auth = authStr.split(":", 2);

    return Map.of("user", auth[0], "password", auth[1]);
  }

  public static String getOidFromRequest(final HttpServletRequest request) {
    final String authorization = request.getHeader("Authorization");
    final Map<String, String> auth = StringUtil.splitAuth(authorization);

    return auth.get("user");
  }
}
