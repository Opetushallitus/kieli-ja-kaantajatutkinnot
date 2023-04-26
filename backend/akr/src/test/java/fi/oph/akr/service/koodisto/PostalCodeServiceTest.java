package fi.oph.akr.service.koodisto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.akr.util.localisation.Language;
import java.util.Optional;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PostalCodeServiceTest {

  private PostalCodeService postalCodeService;

  @BeforeEach
  public void init() {
    postalCodeService = new PostalCodeService();
    postalCodeService.init();
  }

  @Test
  public void test() {
    assertEquals(Optional.of("TAIDEYLIOPISTO"), postalCodeService.getLocalisationValue("00097", Language.FI));
    assertEquals(Optional.of("KONSTUNIVERSITETET"), postalCodeService.getLocalisationValue("00097", Language.SV));
    assertEquals(Optional.empty(), postalCodeService.getLocalisationValue("00097", Language.EN));
    assertTrue(postalCodeService.containsKoodistoCode("99999"));
    assertFalse(postalCodeService.containsKoodistoCode("x"));
  }

  @Test
  public void testTranslateTowns() {
    assertEquals(Pair.of("", ""), postalCodeService.translateTown(null));
    assertEquals(Pair.of("", ""), postalCodeService.translateTown(""));
    assertEquals(Pair.of("", ""), postalCodeService.translateTown("  "));
    assertEquals(Pair.of("Tampere", "Tammerfors"), postalCodeService.translateTown("Tampere"));
    assertEquals(Pair.of("Tampere", "Tammerfors"), postalCodeService.translateTown("Tammerfors"));
    assertEquals(Pair.of("Helsinki", "Helsingfors"), postalCodeService.translateTown("HELSINKI"));
    assertEquals(Pair.of("Helsinki", "Helsingfors"), postalCodeService.translateTown("HeLsInGfOrS"));
    assertEquals(Pair.of("Berliini", "Berliini"), postalCodeService.translateTown("BERLIINI"));
    assertEquals(Pair.of("Yli-Ii", "Yli-Ii"), postalCodeService.translateTown("YLI-ii"));
    assertEquals(Pair.of("Smartpost", "Smartpost"), postalCodeService.translateTown("Smartpost"));
    assertEquals(Pair.of("Vastauslähetys", "Vastauslähetys"), postalCodeService.translateTown("Vastauslähetys"));
    assertEquals(Pair.of("Noutopiste", "Noutopiste"), postalCodeService.translateTown("Noutopiste"));
  }
}
