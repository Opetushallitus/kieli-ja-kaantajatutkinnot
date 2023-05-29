package fi.oph.vkt.util;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;

public class StringUtil {

  public static String trim(final String nullable) {
    return nullable != null ? nullable.trim() : null;
  }

  public static String sanitize(final String nullable) {
    return nullable != null
      ? trim(Jsoup.clean(nullable, "", Safelist.none(), new Document.OutputSettings().prettyPrint(false)))
      : null;
  }
}
