package fi.oph.otr.onr.dto;

import javax.validation.constraints.NotBlank;

public class ContactDetailsDTO {

  @NotBlank
  private String yhteystietoTyyppi;

  @NotBlank
  private String yhteystietoArvo;

  public ContactDetailsDTO(final String type, final String value) {
    this.yhteystietoTyyppi = type;
    this.yhteystietoArvo = value;
  }

  public String type() {
    return this.yhteystietoTyyppi;
  }

  public String value() {
    return this.yhteystietoArvo;
  }

  public void setValue(final String value) {
    this.yhteystietoArvo = value;
  }
}
