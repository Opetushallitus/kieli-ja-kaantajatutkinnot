package fi.oph.akt.util.prod;

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
    assertEquals("VROOMSHOOP", resolveCity("VROOMSHOOP   NETHERLANS", " Netherlands "));
  }

  private String resolveCity(final String city, final String country) {
    return TranslatorRow.builder().city(city).country(country).build().resolveCity(Map.of());
  }

  @Test
  public void testResolveCountry() {
    assertEquals(null, resolveCountry(""));
    assertEquals(null, resolveCountry(" "));
    assertEquals(null, resolveCountry(" sUomi "));
    assertEquals("'foo'", resolveCountry(" foo "));
    assertEquals("'Deutschland'", resolveCountry(" Deutschland "));
    assertEquals("'Deutschland'", resolveCountry(" Deutshland "));
    assertEquals("'Deutschland'", resolveCountry(" DEUTSCHLAND "));
    assertEquals("'Deutschland'", resolveCountry(" Saksa "));
    assertEquals("'Netherlands'", resolveCountry(" NETHERLANS "));
  }

  private String resolveCountry(final String country) {
    return TranslatorRow.builder().country(country).build().resolveCountry(Set.of());
  }
}
