package fi.oph.otr.onr.dto;

import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class PersonalDataDTO {

  @NotBlank
  private String oidHenkilo;

  @NotBlank
  private String etunimet;

  @NotBlank
  private String sukunimi;

  @NotBlank
  private String hetu;

  @NotNull
  private List<ContactDetailsGroupDTO> yhteystiedotRyhma;

  public String onrId() {
    return this.oidHenkilo;
  }

  public String firstName() {
    return this.etunimet;
  }

  public String lastName() {
    return this.sukunimi;
  }

  public String identityNumber() {
    return this.hetu;
  }

  public void setFirstName(final String value) {
    this.etunimet = value;
  }

  public void setLastName(final String value) {
    this.sukunimi = value;
  }

  public void setIdentityNumber(final String value) {
    this.hetu = value;
  }

  /**
   * Find contact details group of OTR
   */
  public ContactDetailsGroupDTO contactDetails() {
    return yhteystiedotRyhma
      .stream()
      .filter(contactDetailsGroupDTO ->
        contactDetailsGroupDTO.type().equals("yhteystietotyyppi13") &&
        contactDetailsGroupDTO.source().equals("alkupera7")
      )
      .findAny()
      .get();
  }
}
