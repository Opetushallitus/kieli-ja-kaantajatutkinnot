package fi.oph.yki.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import fi.oph.yki.model.type.EvaluationState;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PublicPersonRegistrationDTO(
  Long id,
  Long examSessionId,
  RegistrationState state,
  RegistrationKind kind,
  PartialExamType partialExamType,
  LocalDate examDate,
  String languageCode,
  String levelCode,
  ExamSessionType type,
  String startTimeReadListen,
  String startTimeSpeakWrite,
  LocalDate registrationStartDate,
  LocalDate registrationEndDate,
  EvaluationState evaluationState,
  List<PublicExamSessionLocationDTO> location,
  LocalDateTime paidAt,
  LocalDate expiresAt,
  Integer examFee,
  Boolean isTransferable,
  Boolean isCancellable,
  Boolean isTransfered,
  LocalDateTime liftedFromQueueAt,
  Boolean isFreeRegistration,
  Long positionInQueue
) {}
