package fi.oph.akr.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class HetuUtils {

  public static final boolean ALLOW_FAKE_DEFAULT = true;
  private static boolean allowFake = ALLOW_FAKE_DEFAULT;
  private static final char[] tarkistusmerkit = {
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
  };
  private static final Map<String, String> vuosisataByErotinmerkki = Map
    .of("18", List.of("+"), "19", List.of("-", "Y", "X", "W", "V", "U"), "20", List.of("A", "B", "C", "D", "E", "F"))
    .entrySet()
    .stream()
    .flatMap(erotinByVuosisata ->
      erotinByVuosisata.getValue().stream().map(erotin -> Map.entry(erotin, erotinByVuosisata.getKey()))
    )
    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
  private static final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("ddMMyyyy");

  public static void setAllowFake(final boolean allow) {
    allowFake = allow;
  }

  public static boolean hetuIsValid(final String hetu) {
    if (hetu != null && hetu.length() == 11) {
      try {
        dateFromHetu(hetu);
        return (
          extractTarkistusmerkki(hetu) == tarkistusmerkit[tarkistussumma(hetu) % tarkistusmerkit.length] &&
          checkForFake(hetu)
        );
      } catch (final Exception e) {
        // do not throw exceptions
      }
    }
    return false;
  }

  private static boolean checkForFake(final String hetu) {
    return allowFake || hetu.charAt(7) != '9';
  }

  public static LocalDate dateFromHetu(final String hetu) {
    return LocalDate.parse(
      String.format("%s%s%s", extractPvm(hetu), extractVuosisata(hetu), extractVuosi(hetu)),
      dateFormatter
    );
  }

  public static String sukupuoliFromHetu(final String hetu) {
    return Character.digit(hetu.charAt(9), 10) % 2 == 0 ? "2" : "1";
  }

  private static char extractTarkistusmerkki(final String hetu) {
    return hetu.charAt(10);
  }

  private static int tarkistussumma(final String hetu) {
    return Integer.parseInt(hetu.substring(0, 6) + hetu.substring(7, 10), 10);
  }

  private static String extractVuosisata(final String hetu) {
    return Optional.of(vuosisataByErotinmerkki.get(hetu.substring(6, 7))).get();
  }

  private static String extractVuosi(final String hetu) {
    return hetu.substring(4, 6);
  }

  private static String extractPvm(final String hetu) {
    return hetu.substring(0, 4);
  }
}
