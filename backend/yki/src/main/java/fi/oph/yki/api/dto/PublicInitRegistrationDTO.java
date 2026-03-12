package fi.oph.yki.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import fi.oph.yki.model.type.ExamSessionTicketType;
import lombok.NonNull;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PublicInitRegistrationDTO(
  @NonNull Long examSessionId,
  @NonNull Boolean toQueue,
  @NonNull String personOid,
  @NonNull Long participantId,
  @NonNull Boolean strongAuth,
  @NonNull ExamSessionTicketType partialExamType
) {}
