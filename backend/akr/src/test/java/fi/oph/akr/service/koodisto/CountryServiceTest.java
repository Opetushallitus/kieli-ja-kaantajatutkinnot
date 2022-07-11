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
}
