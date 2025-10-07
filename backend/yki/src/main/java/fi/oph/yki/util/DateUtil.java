package fi.oph.yki.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtil {

  private static final DateTimeFormatter DATE_LOCAL_FORMAT = DateTimeFormatter.ofPattern("d.M.yyyy");

  public static String formatOptionalLocalDate(final LocalDate date) {
    return date == null ? null : date.format(DATE_LOCAL_FORMAT);
  }
}
