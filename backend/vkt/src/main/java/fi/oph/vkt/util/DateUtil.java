package fi.oph.vkt.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtil {

  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
  private static final DateTimeFormatter DATE_LOCAL_FORMAT = DateTimeFormatter.ofPattern("d.M.yyyy");

  public static String formatOptionalDate(final LocalDate date) {
    return date == null ? null : date.format(DATE_FORMAT);
  }

  public static String formatOptionalDatetime(final LocalDateTime datetime) {
    return datetime == null ? null : datetime.format(DATETIME_FORMAT);
  }

  public static String formatBirthdateFromSSN(final String ssn) {
    if (ssn.isEmpty() || !HetuUtils.hetuIsValid(ssn)) {
      return "";
    }

    final LocalDate birthdate = HetuUtils.dateFromHetu(ssn);

    return DATE_LOCAL_FORMAT.format(birthdate);
  }
}
