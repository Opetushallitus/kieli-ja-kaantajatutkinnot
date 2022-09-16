package fi.oph.vkt.util;

import java.time.LocalDate;

public class DateUtil {

  public static boolean isBeforeOrEqualTo(final LocalDate date1, final LocalDate date2) {
    assert date1 != null && date2 != null;

    return !date1.isAfter(date2);
  }
}
