package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PublicRegistrationInitResponseDTO(
  @JsonProperty("registration_id") Long registrationId,
  PublicRegistrationInitErrorDTO error
) {}
