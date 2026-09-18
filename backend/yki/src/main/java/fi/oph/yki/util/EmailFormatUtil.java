package fi.oph.yki.util;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class EmailFormatUtil {

  private static final DateTimeFormatter DATE_FORMAT_WITH_DOTS = DateTimeFormatter.ofPattern("dd.MM.yyyy");

  public static String formatDateWithDots(final LocalDate date) {
    return date.format(DATE_FORMAT_WITH_DOTS);
  }

  public static String formatPrice(final double amount) {
    // DecimalFormat is not thread-safe, so a fresh instance is created per call.
    final DecimalFormatSymbols decimalFormatSymbols = new DecimalFormatSymbols(Locale.getDefault());
    decimalFormatSymbols.setDecimalSeparator(',');
    final DecimalFormat priceFormat = new DecimalFormat("0.00", decimalFormatSymbols);
    return priceFormat.format(amount);
  }
}
