package fi.oph.yki.solki.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Builder;

@Builder
public record OrganizerSyncRequestDTO(
  @JsonProperty("oid") String oid,
  @JsonProperty("nimi") String name,
  @JsonProperty("katuosoite") String streetAddress,
  @JsonProperty("postinumero") String postalCode,
  @JsonProperty("puhelin") String phoneNumber,
  @JsonProperty("postitoimipaikka") String postOffice,
  @JsonProperty("yhteyshenkilo") String contactName,
  @JsonProperty("sposoite") String email,
  @JsonProperty("wwwosoite") String website,
  @JsonProperty("tutkintotarjonta") List<ExamOfferingDTO> examOfferings
) {
  @Builder
  public record ExamOfferingDTO(@JsonProperty("kieli") String languageCode, @JsonProperty("taso") String level) {}
}
