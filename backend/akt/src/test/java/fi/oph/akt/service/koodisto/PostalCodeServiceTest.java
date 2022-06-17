package fi.oph.akt.service.koodisto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.akt.util.localisation.Language;
import java.util.Optional;
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
}
