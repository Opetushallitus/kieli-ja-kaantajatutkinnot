package fi.oph.yki.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtil {

  private static final DateTimeFormatter DATE_LOCAL_FORMAT = DateTimeFormatter.ofPattern("d.M.yyyy");
  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

  public static String formatOptionalLocalDate(final LocalDate date) {
    return date == null ? null : date.format(DATE_LOCAL_FORMAT);
  }

  public static String formatOptionalDate(final LocalDate date) {
    return date == null ? null : date.format(DATE_FORMAT);
  }

  public static String formatOptionalDateTime(final LocalDateTime dateTime) {
    return dateTime == null ? null : dateTime.format(DATETIME_FORMAT);
  }
}
