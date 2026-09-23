package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.oph.yki.model.type.PartialExamType;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicRegistrationInitDTO(
  @NonNull @NotNull @JsonProperty("exam_session_id") Long examSessionId,
  @JsonProperty("to_queue") Boolean toQueue,
  @JsonProperty("partial_exam_type") PartialExamType partialExamType
) {}
