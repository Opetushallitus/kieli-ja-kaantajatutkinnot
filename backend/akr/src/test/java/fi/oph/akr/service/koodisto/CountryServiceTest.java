package fi.oph.akr.service.koodisto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.akr.util.localisation.Language;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CountryServiceTest {

  private CountryService countryService;

  @BeforeEach
  public void init() {
    countryService = new CountryService();
    countryService.init();
  }

  @Test
  public void test() {
    assertEquals(Optional.of("Ruotsi"), countryService.getLocalisationValue("SWE", Language.FI));
    assertEquals(Optional.of("Sverige"), countryService.getLocalisationValue("SWE", Language.SV));
    assertEquals(Optional.of("Sweden"), countryService.getLocalisationValue("SWE", Language.EN));
    assertTrue(countryService.containsKoodistoCode("FIN"));
    assertFalse(countryService.containsKoodistoCode("x"));
  }

  @Test
  public void testTranslateCountries() {
    assertEquals(null, countryService.getCountryCode(null));
    assertEquals(null, countryService.getCountryCode(""));
    assertEquals(null, countryService.getCountryCode("  "));
    assertEquals("Some unknown country", countryService.getCountryCode("Some unknown country"));
    assertEquals("FIN", countryService.getCountryCode("FIN"));
    assertEquals("FIN", countryService.getCountryCode("Suomi"));
    assertEquals("FIN", countryService.getCountryCode("SUOMI"));
    assertEquals("FIN", countryService.getCountryCode("Finland"));
    assertEquals("ESP", countryService.getCountryCode("Spanien"));
    assertEquals("ESP", countryService.getCountryCode("SPANIEN"));
    assertEquals("ESP", countryService.getCountryCode("Spain"));
    assertEquals("ESP", countryService.getCountryCode("SPAIN"));
  }
}
