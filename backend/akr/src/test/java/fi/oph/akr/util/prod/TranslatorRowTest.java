package fi.oph.akr.util.prod;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class TranslatorRowTest {

  @Test
  public void testResolveCity() {
    assertEquals("", resolveCity(" ", ""));
    assertEquals("", resolveCity(" ", " "));
    assertEquals("", resolveCity("  ", " "));
    assertEquals("Berlin", resolveCity("  Berlin     ", ""));
    assertEquals("Berlin foo", resolveCity("  Berlin foo ", " Germany  "));
    assertEquals("Berlin", resolveCity("Berlin GERMANY", "Germany"));
    assertEquals("Berlin", resolveCity("Berlin   GERMANY", " Germany "));
    assertEquals("Berlin", resolveCity("Berlin   Deutshland", " Saksa "));
    assertEquals("Vroomshoop", resolveCity("VROOMSHOOP   NETHERLANS", " Netherlands "));
    assertEquals("Isolla-kokonaan", resolveCity("ISOLLA-KOKONAAN", ""));
  }

  private String resolveCity(final String city, final String country) {
    return TranslatorRow.builder().city(city).country(country).build().resolveCity(Map.of());
  }

  @Test
  public void testResolveCountry() {
    assertEquals(null, resolveCountry(""));
    assertEquals(null, resolveCountry(" "));
    assertEquals(null, resolveCountry(" sUomi "));
    assertEquals("'FOO'", resolveCountry(" foo "));
    assertEquals("'GER'", resolveCountry(" Deutschland "));
    assertEquals("'GER'", resolveCountry(" Deutshland "));
    assertEquals("'GER'", resolveCountry(" DEUTSCHLAND "));
    assertEquals("'GER'", resolveCountry(" Saksa "));
    assertEquals("'NLD'", resolveCountry(" NETHERLANS "));
  }

  private String resolveCountry(final String country) {
    return TranslatorRow
      .builder()
      .country(country)
      .build()
      .resolveCountry(Set.of(), Map.of("foo", "FOO", "deutschland", "GER", "saksa", "GER", "netherlands", "NLD"));
  }
}
