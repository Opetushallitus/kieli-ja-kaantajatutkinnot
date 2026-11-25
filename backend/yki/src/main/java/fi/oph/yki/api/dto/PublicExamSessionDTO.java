package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.Builder;

@Builder
public record PublicExamSessionDTO(
  long id,
  @JsonProperty("language_code") String languageCode,
  @JsonProperty("level_code") String levelCode,
  ExamSessionType type,
  @JsonProperty("session_date") LocalDate sessionDate,
  @JsonProperty("registration_start_date") LocalDate registrationStartDate,
  @JsonProperty("registration_end_date") LocalDate registrationEndDate,
  @JsonProperty("start_time_read_listen") String startTimeReadListen,
  @JsonProperty("start_time_speak_write") String startTimeSpeakWrite,
  @JsonProperty("max_participants") int maxParticipants,
  @JsonProperty("max_participants_read_listen") Integer maxParticipantsReadListen,
  @JsonProperty("max_participants_speak_write") Integer maxParticipantsSpeakWrite,
  long participants,
  @JsonProperty("participants_read_listen") Long participantsReadListen,
  @JsonProperty("participants_speak_write") Long participantsSpeakWrite,
  long queue,
  @JsonProperty("published_at") LocalDateTime publishedAt,
  List<PublicExamSessionLocationDTO> location,
  @JsonProperty("exam_fee") Integer examFee,
  @JsonProperty("available_registration_kind") RegistrationKind availableRegistrationKind,
  @JsonProperty("partial_registration_kind") Map<PartialExamType, RegistrationKind> partialRegistrationKind,
  @JsonProperty("office_oid") String officeOid,
  @JsonProperty("organizer_oid") String organizerOid,
  List<PublicExamSessionContactDTO> contact,
  boolean open,
  @JsonProperty("upcoming_admission") boolean upcomingAdmission
) {}
