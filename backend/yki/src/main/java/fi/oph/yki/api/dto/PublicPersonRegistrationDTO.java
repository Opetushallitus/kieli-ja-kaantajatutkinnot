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

// DECIDE: legacy select-person-registrations (queries.sql:1940) also returns es.start_time.
// Left out: ExamSession.java has no start_time field and the frontend never reads it
// (interfaces/userDetails.ts:37-60). Add it back if "same fields" is meant literally.
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
  // DECIDE: legacy sends paid_at and lifted_from_queue_at as UTC timestamps ("...Z").
  // LocalDateTime has no zone, so the frontend's dayjs() reads them as browser-local time.
  // Same as ClerkCustomerRegistrationDTO today; switch to OffsetDateTime if the hour matters.
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
