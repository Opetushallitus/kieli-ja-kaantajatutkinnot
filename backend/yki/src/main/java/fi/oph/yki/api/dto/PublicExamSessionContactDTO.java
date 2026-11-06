package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record PublicExamSessionContactDTO(
  String name,
  String email,
  @JsonProperty("phone_number") String phoneNumber
) {}
