package fi.oph.yki.service;

import fi.oph.yki.api.dto.PublicExamSessionDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitResponseDTO;
import fi.oph.yki.api.dto.PublicUserDTO;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.ParticipantRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
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

  @Transactional
  public PublicRegistrationInitResponseDTO initRegistration(
    final HttpServletRequest request,
    final PublicRegistrationInitDTO initDTO
  ) {
    LOG.info("START: Init exam session {} registration", initDTO.examSessionId());

    // Step 1: Resolve session identity → participant
    final Participant participant = getOrCreateParticipant(request);

    // Step 2: Check for an existing STARTED registration for this participant + exam session
    final PartialExamType partialExamType = initDTO.partialExamType() != null
      ? initDTO.partialExamType()
      : PartialExamType.ALL_PARTS;

    // TODO: implement findStartedRegistration — query registration table for
    //   state = STARTED, participant_id, exam_session_id, partial_exam_type
    //   (see: select-started-registration-id-and-kind-by-participant in queries.sql)
    final Registration existingStarted = findStartedRegistration(participant, initDTO.examSessionId(), partialExamType);

    if (existingStarted != null) {
      LOG.info("Found existing STARTED registration {}", existingStarted.getId());
      return buildResponse(existingStarted, request);
    }

    // Step 3: Check if registration is open for this exam session
    // TODO: implement isRegistrationOpen — call DB function exam_session_registration_open(exam_session_id)
    //   (see: select-exam-session-registration-open in queries.sql)
    if (!isRegistrationOpen(initDTO.examSessionId())) {
      throw new APIException(APIExceptionType.REGISTRATION_CLOSED);
    }

    // Step 4: Determine registration kind (ADMISSION vs QUEUE)
    // TODO: implement getRegistrationKinds — call DB function select_registration_kind for each partial exam type
    //   (see: select-exam-session-registration-kinds in queries.sql)
    //   Returns a map of PartialExamType → RegistrationKind ("ADMISSION" or "QUEUE")
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

  private boolean isRegistrationOpen(final long examSessionId) {
    // TODO: call exam_session_registration_open DB function
    throw new UnsupportedOperationException("TODO: implement isRegistrationOpen");
  }

  private RegistrationKind resolveRegistrationKind(final PublicRegistrationInitDTO initDTO) {
    // TODO: determine ADMISSION vs QUEUE based on:
    //   1. Query select_registration_kind for the exam session's partial exam types
    //   2. If toQueue=true and queue is allowed → QUEUE
    //   3. If admission is available → ADMISSION
    //   4. Otherwise throw appropriate error (FULL, etc.)
    throw new UnsupportedOperationException("TODO: implement resolveRegistrationKind");
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
