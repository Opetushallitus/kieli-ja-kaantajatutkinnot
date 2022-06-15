package fi.oph.akt.util.prod;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;

public class RowUtils {

  public static LocalDate date(final String s) {
    if (s == null || s.isBlank()) {
      return null;
    }
    final String[] parts = s.split(" ")[0].split("/");
    final int year = Integer.parseInt(parts[2]);
    final int month = Integer.parseInt(parts[0]);
    final int day = Integer.parseInt(parts[1]);
    return LocalDate.of(year > 50 ? year + 1900 : year + 2000, month, day);
  }

  public static boolean bool(final String s) {
    if (Objects.equals("TRUE", s)) {
      return true;
    }
    if (Objects.equals("FALSE", s)) {
      return false;
    }
    throw new RuntimeException("Invalid boolean:" + s);
  }

  public static <T> Optional<T> firstNonNull(T... vals) {
    return Arrays.asList(vals).stream().filter(Objects::nonNull).findFirst();
  }

  //  public static <T> String firstNonNullAsSqlStringOrNull(T... vals) {
  //    return firstNonNull(vals).map(d -> toStringSqlQuoted(d)).orElse(null);
  //  }

  public static String toStringSqlQuoted(final Object d) {
    if (d == null) {
      return null;
    }
    return "'" + d + "'";
  }

  public static String sqlEscapeQuotes(final String s) {
    return s.replace("'", "''");
  }
}
