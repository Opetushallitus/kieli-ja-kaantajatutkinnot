package fi.oph.yki.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
  LocalDateTime publishedAt,
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
  Map<PartialExamType, RegistrationKind> partialRegistrationKind
) {}
