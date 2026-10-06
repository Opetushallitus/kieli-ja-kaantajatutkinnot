package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import lombok.Builder;

@Builder
public record PublicRegistrationDetailsDTO(
  long id,
  RegistrationKind kind,
  @JsonProperty("partial_exam_type") PartialExamType partialExamType,
  RegistrationState state,
  @JsonProperty("exam_session") PublicExamSessionDTO examSession
) {}
