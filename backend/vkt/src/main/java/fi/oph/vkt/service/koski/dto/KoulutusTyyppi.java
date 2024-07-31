package fi.oph.vkt.service.koski.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum KoulutusTyyppi {
  @JsonProperty("ylioppilastutkinto")
  MatriculationExam("ylioppilastutkinto"),

  @JsonProperty("korkeakoulutus")
  HigherEducation("korkeakoulutus"),

  @JsonProperty("diatutkinto")
  DIA("diatutkinto"),

  @JsonProperty("ebtutkinto")
  EB("ebtutkinto");

  private final String text;

  KoulutusTyyppi(final String text) {
    this.text = text;
  }

  @Override
  public String toString() {
    return text;
  }
}
