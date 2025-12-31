package fi.oph.yki.util;

import jakarta.annotation.Nullable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class SsnUtil {

  /**
   * Converts string that is in format ppkkvvynnnt, into a date
   */
  private static LocalDate convertToDatePartToDate(String ssn) {
    int day = Integer.parseInt(ssn.substring(0, 2));
    int month = Integer.parseInt(ssn.substring(2, 4));
    int yearTwoDigits = Integer.parseInt(ssn.substring(4, 6));

    char centurySeparator = ssn.charAt(6);

    int century;
    if (centurySeparator == '+') {
      century = 1800;
    } else if (
      centurySeparator == '-' ||
      centurySeparator == 'Y' ||
      centurySeparator == 'X' ||
      centurySeparator == 'W' ||
      centurySeparator == 'V' ||
      centurySeparator == 'U'
    ) {
      century = 1900;
    } else if (
      centurySeparator == 'A' ||
      centurySeparator == 'B' ||
      centurySeparator == 'C' ||
      centurySeparator == 'D' ||
      centurySeparator == 'E' ||
      centurySeparator == 'F'
    ) {
      century = 2000;
    } else {
      return null;
    }

    int year = century + yearTwoDigits;

    return LocalDate.of(year, month, day);
  }

  /**
   * Relatively loose check whether the given string is a valid finnish SSN.
   * Tries to parse the date part and checks whether the checksum is a number or letter.
   */
  private static boolean isValidSsn(@Nullable String ssn) {
    if (ssn == null) {
      return false;
    }

    try {
      // format: ppkkvvynnnt

      // day
      Integer.parseInt(ssn.substring(0, 2));

      // month
      Integer.parseInt(ssn.substring(2, 4));

      // year in two digits
      Integer.parseInt(ssn.substring(4, 6));

      final var centurySeparator = ssn.charAt(6);
      if (centurySeparator != '+' && centurySeparator != '-' && !Character.isLetter(centurySeparator)) {
        return false;
      }

      // individual number
      Integer.parseInt(ssn.substring(7, 10));

      final var checksum = ssn.charAt(10);
      if (!Character.isDigit(checksum) && !Character.isLetter(checksum)) {
        return false;
      }

      return ssn.length() == 11;
    } catch (Exception e) {
      return false;
    }
  }

  public static Optional<String> findValidSsn(String[] possibleSsns) {
    for (String possibleSsn : possibleSsns) {
      if (isValidSsn(possibleSsn)) {
        return Optional.of(possibleSsn);
      }
    }

    return Optional.empty();
  }
}
