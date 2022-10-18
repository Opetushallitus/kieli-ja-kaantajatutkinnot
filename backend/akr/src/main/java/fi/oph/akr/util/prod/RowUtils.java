package fi.oph.akr.util.prod;

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
    if (parts.length == 3) {
      final int year = Integer.parseInt(parts[2]);
      final int month = Integer.parseInt(parts[0]);
      final int day = Integer.parseInt(parts[1]);
      return LocalDate.of(year > 50 ? year + 1900 : year + 2000, month, day);
    }
    return parseMonthFromText(s);
  }

  private static LocalDate parseMonthFromText(final String s) {
    final String[] parts = s.split(" ")[0].split("-");
    final int year = Integer.parseInt(parts[2]);
    final int month = monthFromText(parts[1]);
    final int day = Integer.parseInt(parts[0]);
    return LocalDate.of(year > 50 ? year + 1900 : year + 2000, month, day);
  }

  private static int monthFromText(final String monthAsText) {
    switch (monthAsText.toLowerCase()) {
      case "jan":
        return 1;
      case "feb":
        return 2;
      case "mar":
        return 3;
      case "apr":
        return 4;
      case "may":
        return 5;
      case "jun":
        return 6;
      case "jul":
        return 7;
      case "aug":
        return 8;
      case "sep":
        return 9;
      case "oct":
        return 10;
      case "nov":
        return 11;
      case "dec":
        return 12;
    }
    return -1;
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
    return Arrays.stream(vals).filter(Objects::nonNull).findFirst();
  }

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
