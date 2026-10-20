package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import lombok.Builder;

@Builder
public record PublicRegistrationInitResponseDTO(
  @JsonProperty("exam_session") PublicExamSessionDTO examSession,
  @JsonProperty("is_strongly_identified") boolean isStronglyIdentified,
  @JsonProperty("registration_id") long registrationId,
  @JsonProperty("registration_kind") RegistrationKind registrationKind,
  @JsonProperty("partial_exam_type") PartialExamType partialExamType,
  @JsonProperty("user") PublicUserDTO user,
  @JsonProperty("expires_in") Long expiresIn
) {}
