package fi.oph.otr.onr.dto;

import java.util.List;
import java.util.Optional;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class PersonalDataDTO {

  @NotBlank
  private String oidHenkilo;

  @NotBlank
  private String etunimet;

  @NotBlank
  private String sukunimi;

  private String kutsumanimi;

  @NotBlank
  private String hetu;

  private Boolean yksiloityVTJ;

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

  public String nickName() {
    return this.kutsumanimi;
  }

  public String identityNumber() {
    return this.hetu;
  }

  public boolean isIndividualised() {
    return this.yksiloityVTJ != null ? this.yksiloityVTJ : false;
  }

  public List<ContactDetailsGroupDTO> contactDetailsGroups() {
    return this.yhteystiedotRyhma;
  }

  public void setFirstName(final String value) {
    this.etunimet = value;
  }

  public void setLastName(final String value) {
    this.sukunimi = value;
  }

  public void setNickName(final String value) {
    this.kutsumanimi = value;
  }

  public void setIdentityNumber(final String value) {
    this.hetu = value;
  }

  public void setIndividualised(final boolean value) {
    this.yksiloityVTJ = value;
  }

  /**
   * Find contact details group of OTR
   */
  public Optional<ContactDetailsGroupDTO> findOtrContactDetails() {
    return yhteystiedotRyhma
      .stream()
      .filter(contactDetailsGroupDTO ->
        contactDetailsGroupDTO.type().equals("yhteystietotyyppi13") &&
        contactDetailsGroupDTO.source().equals("alkupera7")
      )
      .findAny();
  }
}
