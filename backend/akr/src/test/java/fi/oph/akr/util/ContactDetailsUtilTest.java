package fi.oph.akr.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.akr.api.dto.translator.TranslatorAddressDTO;
import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.ContactDetailsUtil;
import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.dto.ContactDetailsGroupType;
import fi.oph.akr.onr.model.PersonalData;
import java.util.List;
import org.junit.jupiter.api.Test;

public class ContactDetailsUtilTest {

  @Test
  public void shouldReturnPreferableAddress() {
    final Translator translator = new Translator();
    final PersonalData personalData = defaultPersonalData();

    final TranslatorAddressDTO translatorAddressDTO = ContactDetailsUtil.getPrimaryAddress(personalData, translator);
    assertEquals("Oulu", translatorAddressDTO.town());
  }

  @Test
  public void shouldReturnAkrAddressWhenNoChoice() {
    final Translator translator = new Translator();
    final PersonalData personalData = missingTownPersonalData();

    final TranslatorAddressDTO translatorAddressDTO = ContactDetailsUtil.getPrimaryAddress(personalData, translator);
    assertEquals(ContactDetailsGroupSource.AKR, translatorAddressDTO.source());
  }

  @Test
  public void shouldReturnSelectedAddress() {
    final Translator translator = new Translator();
    translator.setSelectedSource(ContactDetailsGroupSource.AKR.toString());
    translator.setSelectedType(ContactDetailsGroupType.AKR_OSOITE.toString());
    final PersonalData personalData = defaultPersonalData();

    final TranslatorAddressDTO translatorAddressDTO = ContactDetailsUtil.getPrimaryAddress(personalData, translator);
    assertEquals("Kuusamo", translatorAddressDTO.town());
  }

  @Test
  public void shouldReturnAddressWhenSelectedNotFound() {
    final Translator translator = new Translator();
    translator.setSelectedSource(ContactDetailsGroupSource.OTR.toString());
    translator.setSelectedType(ContactDetailsGroupType.OTR_OSOITE.toString());
    final PersonalData personalData = defaultPersonalData();

    final TranslatorAddressDTO translatorAddressDTO = ContactDetailsUtil.getPrimaryAddress(personalData, translator);
    assertEquals("Oulu", translatorAddressDTO.town());
  }

  private PersonalData defaultPersonalData() {
    return PersonalData
      .builder()
      .onrId("1.246.562.24.A00000000001")
      .individualised(true)
      .hasIndividualisedAddress(true)
      .lastName("Lehtinen")
      .firstName("Matti Tauno")
      .nickName("Matti")
      .identityNumber("090687-913J")
      .address(
        List.of(
          TranslatorAddressDTO
            .builder()
            .street("Kajaanintie 123")
            .postalCode("93600")
            .town("Kuusamo")
            .country("FINLAND")
            .source(ContactDetailsGroupSource.AKR)
            .type(ContactDetailsGroupType.AKR_OSOITE)
            .build(),
          TranslatorAddressDTO
            .builder()
            .street("Hallituskatu 123")
            .postalCode("90100")
            .town("Oulu")
            .country("FINLAND")
            .source(ContactDetailsGroupSource.VTJ)
            .type(ContactDetailsGroupType.VAKINAINEN_KOTIMAAN_OSOITE)
            .build(),
          TranslatorAddressDTO
            .builder()
            .street("Downing street 123")
            .postalCode("00100")
            .town("London")
            .country("UK")
            .source(ContactDetailsGroupSource.VTJ)
            .type(ContactDetailsGroupType.VAKINAINEN_ULKOMAAN_OSOITE)
            .build()
        )
      )
      .build();
  }

  private PersonalData missingTownPersonalData() {
    return PersonalData
      .builder()
      .onrId("1.246.562.24.A00000000001")
      .individualised(true)
      .hasIndividualisedAddress(true)
      .lastName("Lehtinen")
      .firstName("Matti Tauno")
      .nickName("Matti")
      .identityNumber("090687-913J")
      .address(
        List.of(
          TranslatorAddressDTO
            .builder()
            .street("Hallituskatu 123")
            .postalCode("90100")
            .town(null)
            .country("FINLAND")
            .source(ContactDetailsGroupSource.VTJ)
            .type(ContactDetailsGroupType.VAKINAINEN_KOTIMAAN_OSOITE)
            .build(),
          TranslatorAddressDTO
            .builder()
            .street("Kajaanintie 123")
            .postalCode("93600")
            .town(null)
            .country("FINLAND")
            .source(ContactDetailsGroupSource.AKR)
            .type(ContactDetailsGroupType.AKR_OSOITE)
            .build(),
          TranslatorAddressDTO
            .builder()
            .street("Downing street 123")
            .postalCode("00100")
            .town(null)
            .country("UK")
            .source(ContactDetailsGroupSource.VTJ)
            .type(ContactDetailsGroupType.VAKINAINEN_ULKOMAAN_OSOITE)
            .build()
        )
      )
      .build();
  }
}
