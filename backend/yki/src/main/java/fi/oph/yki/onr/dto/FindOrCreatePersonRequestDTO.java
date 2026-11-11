package fi.oph.yki.onr.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record FindOrCreatePersonRequestDTO(
  @JsonProperty("identifications") List<Identification> identifications,
  @JsonProperty("hetu") String identityNumber,
  @JsonProperty("etunimet") String firstNames,
  @JsonProperty("kutsumanimi") String nickname,
  @JsonProperty("sukunimi") String lastName,
  @JsonProperty("syntymaaika") String birthdate,
  @JsonProperty("aidinkieli") Language nativeLanguage,
  @JsonProperty("asiointiKieli") Language contactLanguage,
  @JsonProperty("kansalaisuus") List<Nationality> nationalities,
  @JsonProperty("sukupuoli") String gender
) {
  @Builder
  public record Identification(
    @JsonProperty("idpEntityId") String idpEntityId,
    @JsonProperty("identifier") String identifier
  ) {}

  public record Language(@JsonProperty("kieliKoodi") String languageCode) {}

  public record Nationality(@JsonProperty("kansalaisuusKoodi") String nationalityCode) {}
}
