package fi.oph.yki.service;

import fi.oph.yki.api.dto.PublicExamSessionDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitResponseDTO;
import fi.oph.yki.api.dto.PublicUserDTO;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import java.util.List;
import java.util.Map;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.ParticipantRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
  private final ParticipantRepository participantRepository;

  private static final Map<ExamSessionType, Set<PartialExamType>> ALLOWED_PARTIAL_EXAM_TYPES = Map.of(
    ExamSessionType.FULL, Set.of(PartialExamType.ALL_PARTS),
    ExamSessionType.READ_SPEAK, Set.of(PartialExamType.ALL_PARTS, PartialExamType.READ, PartialExamType.SPEAK),
    ExamSessionType.LISTEN_WRITE, Set.of(PartialExamType.ALL_PARTS, PartialExamType.LISTEN, PartialExamType.WRITE)
  );

  @Transactional
  public PublicRegistrationInitResponseDTO initRegistration(
    final HttpServletRequest request,
    final PublicRegistrationInitDTO initDTO
  ) {
    LOG.info("START: Init exam session {} registration", initDTO.examSessionId());

    final ExamSession examSession = examSessionRepository.findById(initDTO.examSessionId())
      .orElseThrow(() -> new APIException(APIExceptionType.NOT_FOUND));

    final PartialExamType partialExamType = initDTO.partialExamType() != null
      ? initDTO.partialExamType()
      : PartialExamType.ALL_PARTS;

    if (!isRegistrationOpen(examSession)) {
      throw new APIException(APIExceptionType.REGISTRATION_CLOSED);
    }

    validatePartialExamType(examSession, partialExamType);

    // Step 1: Resolve session identity → participant
    final Participant participant = getOrCreateParticipant(request);

    // Step 2: Check for an existing STARTED registration for this participant + exam session
    // TODO: implement findStartedRegistration — query registration table for
    //   state = STARTED, participant_id, exam_session_id, partial_exam_type
    //   (see: select-started-registration-id-and-kind-by-participant in queries.sql)
    final Registration existingStarted = findStartedRegistration(participant, initDTO.examSessionId(), partialExamType);

    if (existingStarted != null) {
      LOG.info("Found existing STARTED registration {}", existingStarted.getId());
      return buildResponse(existingStarted, request);
    }

    // Step 3: Determine registration kind (ADMISSION vs QUEUE)
    final RegistrationKind registrationKind = resolveRegistrationKind(initDTO);

    // Step 5: Check for conflicting registrations on the same exam date
    // TODO: implement hasConflictingRegistration — check if participant is already registered
    //   to another exam session on the same exam date
    //   (see: select-participant-registered-to-exam-on-exam-date in queries.sql)
    if (hasConflictingRegistration(participant, initDTO.examSessionId(), partialExamType)) {
      throw new APIException(APIExceptionType.REGISTRATION_CONFLICT);
    }

    // Step 6: Create new STARTED registration
    // TODO: implement createRegistration — INSERT registration with state=STARTED
    //   The old backend uses a DB-level constraint to prevent exceeding max_participants.
    //   Handle PSQLException for max_participants exceeded → throw REGISTRATION_FULL
    //   (see: insert-registration<! in queries.sql)
    final Registration registration = createRegistration(
      initDTO.examSessionId(),
      participant,
      registrationKind,
      partialExamType,
      isStronglyIdentified(request)
    );

    LOG.info("END: Init exam session {} registration success {}", initDTO.examSessionId(), registration.getId());
    return buildResponse(registration, request);
  }

  private Participant getOrCreateParticipant(final HttpServletRequest request) {
    // TODO: resolve external-user-id from session/auth
    //   Old backend: get-or-create-session then get-or-create-participant
    //   If no authenticated identity, create anonymous session with UUID
    //   Then find or insert participant by external_user_id
    throw new UnsupportedOperationException("TODO: implement getOrCreateParticipant");
  }

  private Registration findStartedRegistration(
    final Participant participant,
    final long examSessionId,
    final PartialExamType partialExamType
  ) {
    // TODO: query for STARTED registration matching participant + exam session + partial exam type
    throw new UnsupportedOperationException("TODO: implement findStartedRegistration");
  }

  private Boolean isRegistrationOpen(final ExamSession examSession) {
    final LocalDate now = LocalDate.now();
    final LocalDate start = examSession.getExamDate().getRegistrationStartDate();
    final LocalDate end = examSession.getExamDate().getRegistrationEndDate();

    return start != null && end != null && now.isAfter(start) && now.isBefore(end);
  }

  private void validatePartialExamType(final ExamSession examSession, final PartialExamType partialExamType) {
    final Set<PartialExamType> allowed = ALLOWED_PARTIAL_EXAM_TYPES.get(examSession.getType());
    if (allowed == null || !allowed.contains(partialExamType)) {
      throw new APIException(APIExceptionType.REGISTRATION_INVALID_PARTIAL_EXAM_TYPE);
    }
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

  private RegistrationKind selectRegistrationKind(final ExamSession examSession, final PartialExamType partialExamType) {
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
    final Participant participant,
    final long examSessionId,
    final PartialExamType partialExamType
  ) {
    // TODO: check participant-registered-to-exam-on-exam-date
    throw new UnsupportedOperationException("TODO: implement hasConflictingRegistration");
  }

  private Registration createRegistration(
    final long examSessionId,
    final Participant participant,
    final RegistrationKind kind,
    final PartialExamType partialExamType,
    final boolean strongAuth
  ) {
    final ExamSession examSession = examSessionRepository.getReferenceById(examSessionId);

    final Registration registration = new Registration();
    registration.setExamSession(examSession);
    registration.setParticipant(participant);
    registration.setState(RegistrationState.STARTED);
    registration.setKind(kind);
    registration.setPartialExamType(partialExamType);
    registration.setStrongAuth(strongAuth);
    registration.setCreatedAt(LocalDateTime.now());

    // TODO: handle PSQLException for max_participants exceeded (DB trigger)
    //   catch and throw APIException(REGISTRATION_FULL)
    return registrationRepository.saveAndFlush(registration);
  }

  private boolean isStronglyIdentified(final HttpServletRequest request) {
    // TODO: determine from session auth-method (SUOMIFI = strong, EMAIL/SESSION = not strong)
    return false;
  }

  private PublicRegistrationInitResponseDTO buildResponse(
    final Registration registration,
    final HttpServletRequest request
  ) {
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
          // TODO: resolve exam fee from payment config based on level
          .examFee(null)
          .build()
      )
      .isStronglyIdentified(isStronglyIdentified(request))
      .registrationId(registration.getId())
      .registrationKind(registration.getKind())
      .partialExamType(registration.getPartialExamType())
      .user(
        PublicUserDTO
          .builder()
          // TODO: resolve from session identity
          .externalUserId(null)
          .email(null)
          .build()
      )
      // TODO: calculate expires_in from registration started_at + timeout config
      .expiresIn(null)
      .build();
  }
}
