package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PublicRegistrationInitErrorDTO(
  boolean full,
  boolean closed,
  @JsonProperty("other-exam-session-registration") PublicOtherExamSessionRegistrationDTO otherExamSessionRegistration,
  @JsonProperty("to-queue") Boolean toQueue,
  boolean partialFull
) {}
