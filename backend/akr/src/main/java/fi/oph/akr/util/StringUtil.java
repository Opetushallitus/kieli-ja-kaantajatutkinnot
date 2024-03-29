package fi.oph.akr.util;

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
}
