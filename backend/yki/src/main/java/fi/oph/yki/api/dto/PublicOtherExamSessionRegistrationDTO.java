package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.oph.yki.model.type.RegistrationState;
import lombok.Builder;

@Builder
public record PublicOtherExamSessionRegistrationDTO(
  long id,
  @JsonProperty("registration_id") long registrationId,
  RegistrationState state
) {}
