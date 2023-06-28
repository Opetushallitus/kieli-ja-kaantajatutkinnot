package fi.oph.vkt.util;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;

public class StringUtil {

  public static String sanitize(final String nullable) {
    if (nullable == null) {
      return null;
    }

    final String clean = Jsoup
      .clean(nullable, "", Safelist.none(), new Document.OutputSettings().prettyPrint(false))
      .trim();

    return clean.startsWith("=") ? clean.substring(1) : clean;
  }
}
