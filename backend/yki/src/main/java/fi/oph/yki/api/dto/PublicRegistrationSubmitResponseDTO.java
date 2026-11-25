package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import lombok.Builder;

@Builder
public record PublicRegistrationSubmitResponseDTO(
  boolean success,
  @JsonProperty("registration_kind") RegistrationKind registrationKind,
  RegistrationState state,
  String code
) {}
