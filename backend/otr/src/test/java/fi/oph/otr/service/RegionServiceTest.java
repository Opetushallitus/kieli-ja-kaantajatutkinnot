package fi.oph.otr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.otr.service.koodisto.RegionService;
import fi.oph.otr.util.localisation.Language;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RegionServiceTest {

  private RegionService regionService;

  @BeforeEach
  public void setup() {
    regionService = new RegionService();
    regionService.init();
  }

  @Test
  public void testListKoodistoCodes() {
    final Set<String> codes = regionService.listKoodistoCodes();

    assertEquals(20, codes.size());
    assertFalse(codes.contains(RegionService.UNKNOWN_REGION));
    assertTrue(codes.contains("01"));
    assertTrue(codes.contains("21"));
  }

  @Test
  public void testGetLocalisationValue() {
    final Optional<String> fi = regionService.getLocalisationValue("21", Language.FI);
    final Optional<String> sv = regionService.getLocalisationValue("21", Language.SV);
    final Optional<String> en = regionService.getLocalisationValue("21", Language.EN);

    assertTrue(fi.isPresent());
    assertTrue(sv.isPresent());
    assertTrue(en.isPresent());

    assertEquals("Ahvenanmaa", fi.get());
    assertEquals("Åland", sv.get());
    assertEquals("Åland", en.get());
  }
}
