package fi.oph.akr.service.koodisto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.akr.util.localisation.Language;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class LanguageServiceTest {

  private LanguageService languageService;

  @BeforeEach
  public void setup() {
    languageService = new LanguageService();
    languageService.init();
  }

  @Test
  public void testListKoodistoCodes() {
    final Set<String> codes = languageService.listKoodistoCodes();

    assertEquals(198, codes.size());
    assertFalse(codes.contains(LanguageService.UNOFFICIAL_LANGUAGE));
    assertFalse(codes.contains(LanguageService.UNKNOWN_LANGUAGE));
    assertFalse(codes.contains(LanguageService.OTHER_LANGUAGE));
    assertFalse(codes.contains(LanguageService.SIGN_LANGUAGE));
    assertTrue(codes.contains("FI"));
    assertTrue(codes.contains("SV"));
  }

  @Test
  public void testGetLocalisationValue() {
    final Optional<String> fi = languageService.getLocalisationValue("SV", Language.FI);
    final Optional<String> sv = languageService.getLocalisationValue("SV", Language.SV);
    final Optional<String> en = languageService.getLocalisationValue("SV", Language.EN);

    assertTrue(fi.isPresent());
    assertTrue(sv.isPresent());
    assertTrue(en.isPresent());

    assertEquals("ruotsi", fi.get());
    assertEquals("svenska", sv.get());
    assertEquals("Swedish", en.get());
  }
}
