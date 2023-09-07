package fi.oph.vkt.util;

import org.apache.commons.codec.digest.DigestUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;

public class StringUtil {

  public static String sanitize(final String nullable) {
    return nullable == null
      ? null
      : Jsoup
        .clean(nullable, "", Safelist.none(), new Document.OutputSettings().prettyPrint(false))
        .trim()
        .replaceAll("^=*", "");
  }

  public static String getHash(final String value, final String salt) {
    return DigestUtils.sha256Hex(value + salt);
  }
}
