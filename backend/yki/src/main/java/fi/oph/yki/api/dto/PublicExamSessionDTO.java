package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.oph.yki.model.type.ExamSessionType;
import java.time.LocalDate;
import lombok.Builder;

@Builder
public record PublicExamSessionDTO(
  long id,
  @JsonProperty("language_code") String languageCode,
  @JsonProperty("level_code") String levelCode,
  ExamSessionType type,
  @JsonProperty("session_date") LocalDate sessionDate,
  @JsonProperty("max_participants") int maxParticipants,
  @JsonProperty("exam_fee") String examFee
) {}
