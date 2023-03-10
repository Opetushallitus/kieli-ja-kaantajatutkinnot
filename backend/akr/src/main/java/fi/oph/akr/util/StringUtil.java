package fi.oph.akr.util;

public class StringUtil {

  public static String trim(final String nullable) {
    return nullable != null ? nullable.trim() : null;
  }
}
