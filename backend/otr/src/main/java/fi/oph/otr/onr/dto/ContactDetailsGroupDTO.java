package fi.oph.otr.onr.dto;

import java.util.Optional;
import java.util.Set;
import javax.validation.constraints.NotBlank;

public class ContactDetailsGroupDTO {

  @NotBlank
  private String ryhmaKuvaus;

  @NotBlank
  private String ryhmaAlkuperaTieto;

  private Set<ContactDetailsDTO> yhteystieto;

  /**
   * yhteystietotyyppi1  Kotiosoite
   * yhteystietotyyppi2  Työosoite
   * yhteystietotyyppi3  Vapaa-ajan osoite
   * yhteystietotyyppi4  VTJ Vakinainen kotimainen osoite
   * yhteystietotyyppi5  VTJ Vakinainen ulkomainen osoite
   * yhteystietotyyppi6  Hakemukselta tuleva yhteystieto
   * yhteystietotyyppi7  Muu osoite
   * yhteystietotyyppi8  VTJ Sähköinen osoite
   * yhteystietotyyppi9  VTJ tilapäinen kotimainen osoite
   * yhteystietotyyppi10 VTJ tilapäinen ulkomainen osoite
   * yhteystietotyyppi11 VTJ kotimainen postiosoite
   * yhteystietotyyppi12 VTJ ulkomainen postiosoite
   * yhteystietotyyppi13 Oikeustulkkirekisterin yhteystiedot
   */
  public String type() {
    return this.ryhmaKuvaus;
  }

  /**
   * alkupera1 VTJ
   * alkupera2 Virkailijan UI
   * alkupera3 Omat tiedot UI
   * alkupera4 Hakulomake
   * alkupera5 Tiedonsiirrot
   * alkupera6 Muu alkuperä
   * alkupera7 Oikeustulkkirekisteri
   */
  public String source() {
    return this.ryhmaAlkuperaTieto;
  }

  public Set<ContactDetailsDTO> contactDetailsSet() {
    return this.yhteystieto;
  }

  public void setEmail(final String value) {
    setValue(ContactDetailsType.EMAIL, value);
  }

  public void setPhoneNumber(final String value) {
    setValue(ContactDetailsType.PHONE_NUMBER, value);
  }

  public void setStreet(final String value) {
    setValue(ContactDetailsType.STREET, value);
  }

  public void setPostalCode(final String value) {
    setValue(ContactDetailsType.POSTAL_CODE, value);
  }

  public void setTown(final String value) {
    setValue(ContactDetailsType.TOWN, value);
  }

  public void setCountry(final String value) {
    setValue(ContactDetailsType.COUNTRY, value);
  }

  private void setValue(final String contactDetailsType, final String value) {
    findContactDetailsDTO(contactDetailsType)
      .ifPresentOrElse(
        contactDetailsDTO -> contactDetailsDTO.setValue(value),
        () -> yhteystieto.add(new ContactDetailsDTO(contactDetailsType, value))
      );
  }

  private Optional<ContactDetailsDTO> findContactDetailsDTO(final String contactDetailsType) {
    if (ContactDetailsType.values.contains(contactDetailsType)) {
      return yhteystieto
        .stream()
        .filter(contactDetailsDTO -> contactDetailsDTO.type().equals(contactDetailsType))
        .findAny();
    }

    throw new IllegalArgumentException("Invalid contact details type " + contactDetailsType);
  }
}
