package fi.oph.yki.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.api.dto.PublicExamSessionDTO;
import fi.oph.yki.api.dto.PublicExamSessionLocationDTO;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.PublicExamSessionProjection;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PublicExamSessionService {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  private static final TypeReference<List<PublicExamSessionLocationDTO>> LOCATIONS_TYPE = new TypeReference<>() {};

  private final ExamSessionRepository examSessionRepository;

  private static List<PublicExamSessionLocationDTO> toLocations(final PublicExamSessionProjection examSession) {
    if (examSession.getLocation() == null) {
      return List.of();
    }
    try {
      return OBJECT_MAPPER.readValue(examSession.getLocation(), LOCATIONS_TYPE);
    } catch (final JsonProcessingException e) {
      throw new RuntimeException("Could not read locations of exam session " + examSession.getId(), e);
    }
  }

  private static Map<PartialExamType, RegistrationKind> toPartialRegistrationKinds(
    final ExamSessionType type,
    final PublicExamSessionProjection examSession
  ) {
    final RegistrationKind allParts = RegistrationKind.valueOf(examSession.getAllPartsRegistrationKind());
    final RegistrationKind readListen = RegistrationKind.valueOf(examSession.getReadListenRegistrationKind());
    final RegistrationKind speakWrite = RegistrationKind.valueOf(examSession.getSpeakWriteRegistrationKind());

    return switch (type) {
      case FULL -> Map.of(PartialExamType.ALL_PARTS, allParts);
      case READ_SPEAK -> Map.of(
        PartialExamType.ALL_PARTS,
        allParts,
        PartialExamType.READ,
        readListen,
        PartialExamType.SPEAK,
        speakWrite
      );
      case LISTEN_WRITE -> Map.of(
        PartialExamType.ALL_PARTS,
        allParts,
        PartialExamType.LISTEN,
        readListen,
        PartialExamType.WRITE,
        speakWrite
      );
    };
  }

  private static PublicExamSessionDTO toDTO(final PublicExamSessionProjection examSession) {
    final ExamSessionType type = ExamSessionType.valueOf(examSession.getType());
    return PublicExamSessionDTO
      .builder()
      .id(examSession.getId())
      .languageCode(examSession.getLanguageCode())
      .levelCode(examSession.getLevelCode())
      .sessionDate(examSession.getSessionDate())
      .maxParticipants(examSession.getMaxParticipants())
      .maxParticipantsReadListen(examSession.getMaxParticipantsReadListen())
      .maxParticipantsSpeakWrite(examSession.getMaxParticipantsSpeakWrite())
      .startTime(examSession.getStartTime())
      .startTimeReadListen(examSession.getStartTimeReadListen())
      .startTimeSpeakWrite(examSession.getStartTimeSpeakWrite())
      .registrationStartDate(examSession.getRegistrationStartDate())
      .registrationEndDate(examSession.getRegistrationEndDate())
      .officeOid(examSession.getOfficeOid())
      .publishedAt(examSession.getPublishedAt())
      .type(type)
      .queue(examSession.getQueue())
      .participants(examSession.getParticipants())
      .participantsReadListen(examSession.getParticipantsReadListen())
      .participantsSpeakWrite(examSession.getParticipantsSpeakWrite())
      .organizerOid(examSession.getOrganizerOid())
      .location(toLocations(examSession))
      .open(examSession.getOpen())
      .upcomingAdmission(examSession.getUpcomingAdmission())
      .availableRegistrationKind(RegistrationKind.valueOf(examSession.getAllPartsRegistrationKind()))
      .partialRegistrationKind(toPartialRegistrationKinds(type, examSession))
      .build();
  }

  @Transactional(readOnly = true)
  public List<PublicExamSessionDTO> getUpcomingExamSessions() {
    return examSessionRepository
      .findPublicExamSessions(LocalDate.now())
      .stream()
      .map(PublicExamSessionService::toDTO)
      .toList();
  }
}
