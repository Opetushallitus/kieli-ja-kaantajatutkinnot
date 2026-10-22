package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record PublicExamSessionLocationDTO(
  String name,
  @JsonProperty("street_address") String streetAddress,
  @JsonProperty("post_office") String postOffice,
  String zip,
  @JsonProperty("other_location_info") String otherLocationInfo,
  @JsonProperty("extra_information") String extraInformation,
  String lang
) {}
