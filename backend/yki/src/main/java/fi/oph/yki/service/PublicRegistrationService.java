package fi.oph.yki.service;

import fi.oph.yki.api.dto.PublicExamSessionDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitResponseDTO;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PublicRegistrationService {

  private static final Logger LOG = LoggerFactory.getLogger(PublicRegistrationService.class);

  private final RegistrationRepository registrationRepository;
  private final ExamSessionRepository examSessionRepository;

  private static final Map<ExamSessionType, Set<PartialExamType>> ALLOWED_PARTIAL_EXAM_TYPES = Map.of(
    ExamSessionType.FULL,
    Set.of(PartialExamType.ALL_PARTS),
    ExamSessionType.READ_SPEAK,
    Set.of(PartialExamType.ALL_PARTS, PartialExamType.READ, PartialExamType.SPEAK),
    ExamSessionType.LISTEN_WRITE,
    Set.of(PartialExamType.ALL_PARTS, PartialExamType.LISTEN, PartialExamType.WRITE)
  );

  @Transactional
  public PublicRegistrationInitResponseDTO initRegistration(
    final Identity identity,
    final PublicRegistrationInitDTO initDTO
  ) {
    LOG.info("START: Init exam session {} registration", initDTO.examSessionId());

    final ExamSession examSession = examSessionRepository
      .findById(initDTO.examSessionId())
      .orElseThrow(() -> new APIException(APIExceptionType.NOT_FOUND));
    final PartialExamType partialExamType = initDTO.partialExamType();

    if (!isRegistrationOpen(examSession)) {
      throw new APIException(APIExceptionType.REGISTRATION_CLOSED);
    }

    if (!isValidPartialExamType(examSession, partialExamType)) {
      throw new APIException(APIExceptionType.REGISTRATION_INVALID_PARTIAL_EXAM_TYPE);
    }

    // Step 3: Check for conflicting registrations on the same exam date
    // TODO: implement hasConflictingRegistration — check if identity is already registered
    //   to another exam session on the same exam date
    if (hasConflictingRegistration(identity, examSession, partialExamType)) {
      throw new APIException(APIExceptionType.REGISTRATION_CONFLICT);
    }

    final RegistrationKind registrationKind = resolveRegistrationKind(initDTO);

    // Step 4: Create new STARTED registration
    final Registration registration = createRegistration(
      initDTO.examSessionId(),
      identity,
      registrationKind,
      partialExamType
    );

    LOG.info("END: Init exam session {} registration success {}", initDTO.examSessionId(), registration.getId());
    return buildResponse(registration);
  }

  private Boolean isRegistrationOpen(final ExamSession examSession) {
    final LocalDate now = LocalDate.now();
    final LocalDate start = examSession.getExamDate().getRegistrationStartDate();
    final LocalDate end = examSession.getExamDate().getRegistrationEndDate();

    return start != null && end != null && now.isAfter(start) && now.isBefore(end);
  }

  private Boolean isValidPartialExamType(final ExamSession examSession, final PartialExamType partialExamType) {
    final Set<PartialExamType> allowed = ALLOWED_PARTIAL_EXAM_TYPES.get(examSession.getType());

    return allowed != null && allowed.contains(partialExamType);
  }

  private RegistrationKind resolveRegistrationKind(final PublicRegistrationInitDTO initDTO) {
    final ExamSession examSession = examSessionRepository.getReferenceById(initDTO.examSessionId());
    final PartialExamType partialExamType = initDTO.partialExamType() != null
      ? initDTO.partialExamType()
      : PartialExamType.ALL_PARTS;
    final boolean toQueue = Boolean.TRUE.equals(initDTO.toQueue());

    final RegistrationKind actualKind = selectRegistrationKind(examSession, partialExamType);

    if (toQueue && actualKind == RegistrationKind.ADMISSION) {
      throw new APIException(APIExceptionType.REGISTRATION_QUEUE_NOT_AVAILABLE);
    }
    if (!toQueue && actualKind == RegistrationKind.QUEUE) {
      throw new APIException(APIExceptionType.REGISTRATION_FULL);
    }

    return actualKind;
  }

  private RegistrationKind selectRegistrationKind(
    final ExamSession examSession,
    final PartialExamType partialExamType
  ) {
    final long examSessionId = examSession.getId();

    if (examSession.getType() == ExamSessionType.FULL) {
      return isPoolFull(examSessionId, List.of(PartialExamType.ALL_PARTS.name()), examSession.getMaxParticipants())
        ? RegistrationKind.QUEUE
        : RegistrationKind.ADMISSION;
    }

    final PartialExamType rlSubType;
    final PartialExamType swSubType;
    if (examSession.getType() == ExamSessionType.READ_SPEAK) {
      rlSubType = PartialExamType.READ;
      swSubType = PartialExamType.SPEAK;
    } else {
      rlSubType = PartialExamType.LISTEN;
      swSubType = PartialExamType.WRITE;
    }

    if (partialExamType == rlSubType || partialExamType == PartialExamType.ALL_PARTS) {
      final List<String> rlTypes = List.of(PartialExamType.ALL_PARTS.name(), rlSubType.name());
      if (isPoolFull(examSessionId, rlTypes, examSession.getMaxParticipantsReadListen())) {
        return RegistrationKind.QUEUE;
      }
      if (partialExamType == rlSubType) {
        return RegistrationKind.ADMISSION;
      }
    }

    final List<String> swTypes = List.of(PartialExamType.ALL_PARTS.name(), swSubType.name());
    if (isPoolFull(examSessionId, swTypes, examSession.getMaxParticipantsSpeakWrite())) {
      return RegistrationKind.QUEUE;
    }

    return RegistrationKind.ADMISSION;
  }

  private boolean isPoolFull(final long examSessionId, final List<String> partialExamTypes, final int maxParticipants) {
    final long queueCount = registrationRepository.countQueueRegistrations(examSessionId, partialExamTypes);
    if (queueCount > 0) {
      return true;
    }
    final long admissionCount = registrationRepository.countAdmissionRegistrations(examSessionId, partialExamTypes);

    return admissionCount >= maxParticipants;
  }

  private boolean hasConflictingRegistration(
    final Identity identity,
    final ExamSession examSession,
    final PartialExamType partialExamType
  ) {
    return registrationRepository.countConflictingRegistrations(
      identity.getId(),
      examSession.getExamDate().getId(),
      examSession.getId(),
      partialExamType.name()
    ) > 0;
  }

  private Registration createRegistration(
    final long examSessionId,
    final Identity identity,
    final RegistrationKind kind,
    final PartialExamType partialExamType
  ) {
    final ExamSession examSession = examSessionRepository.getReferenceById(examSessionId);

    final Registration registration = new Registration();
    registration.setExamSession(examSession);
    registration.setIdentity(identity);
    registration.setState(RegistrationState.STARTED);
    registration.setKind(kind);
    registration.setPartialExamType(partialExamType);
    registration.setCreatedAt(LocalDateTime.now());

    // TODO: handle PSQLException for max_participants exceeded (DB trigger)
    return registrationRepository.saveAndFlush(registration);
  }

  private PublicRegistrationInitResponseDTO buildResponse(final Registration registration) {
    final ExamSession examSession = registration.getExamSession();

    return PublicRegistrationInitResponseDTO
      .builder()
      .examSession(
        PublicExamSessionDTO
          .builder()
          .id(examSession.getId())
          .languageCode(examSession.getLanguage())
          .levelCode(examSession.getLevel())
          .type(examSession.getType())
          .sessionDate(examSession.getExamDate().getExamDate())
          .maxParticipants(examSession.getMaxParticipants())
          .examFee(null)
          .build()
      )
      .registrationId(registration.getId())
      .registrationKind(registration.getKind())
      .partialExamType(registration.getPartialExamType())
      .expiresIn(null)
      .build();
  }
}
