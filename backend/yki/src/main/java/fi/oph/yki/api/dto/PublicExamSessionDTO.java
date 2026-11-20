package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PublicExamSessionDTO(
  Long id,
  String languageCode,
  String levelCode,
  LocalDate sessionDate,
  Integer maxParticipants,
  Integer maxParticipantsReadListen,
  Integer maxParticipantsSpeakWrite,
  String startTime,
  String startTimeReadListen,
  String startTimeSpeakWrite,
  LocalDate registrationStartDate,
  LocalDate registrationEndDate,
  String officeOid,
  // Formatted in UTC by the database in the legacy backend's format, e.g. 2025-11-10T07:55:20.899Z.
  String publishedAt,
  ExamSessionType type,
  long queue,
  long participants,
  long participantsReadListen,
  long participantsSpeakWrite,
  String organizerOid,
  List<PublicExamSessionLocationDTO> location,
  boolean open,
  boolean upcomingAdmission,
  RegistrationKind availableRegistrationKind,
  Map<PartialExamType, RegistrationKind> partialRegistrationKind,
  BigDecimal examFee,
  // Left out of full exam sessions, as in the legacy backend.
  @JsonInclude(JsonInclude.Include.NON_NULL) BigDecimal examFeeReadListen,
  @JsonInclude(JsonInclude.Include.NON_NULL) BigDecimal examFeeSpeakWrite
) {}
