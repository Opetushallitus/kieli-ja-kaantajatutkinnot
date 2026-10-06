package fi.oph.yki.service;

import fi.oph.yki.api.dto.PublicExamSessionDTO;
import fi.oph.yki.api.dto.PublicRegistrationDetailsDTO;
import fi.oph.yki.api.dto.PublicRegistrationFormDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitResponseDTO;
import fi.oph.yki.api.dto.PublicRegistrationSubmitResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
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

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

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

    final List<Registration> conflicting = findConflictingRegistrations(identity, examSession, partialExamType);
    if (!conflicting.isEmpty()) {
      throw new APIException(APIExceptionType.REGISTRATION_CONFLICT);
    }

    final boolean toQueue = Boolean.TRUE.equals(initDTO.toQueue());
    final RegistrationKind availableKind = selectRegistrationKind(examSession, partialExamType);

    if (toQueue && availableKind == RegistrationKind.ADMISSION) {
      throw new APIException(APIExceptionType.REGISTRATION_QUEUE_NOT_AVAILABLE);
    }
    if (!toQueue && availableKind == RegistrationKind.QUEUE) {
      throw new APIException(APIExceptionType.REGISTRATION_FULL);
    }

    final Registration registration = createRegistration(
      initDTO.examSessionId(),
      identity,
      toQueue ? RegistrationKind.QUEUE : RegistrationKind.ADMISSION,
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

  private List<Registration> findConflictingRegistrations(
    final Identity identity,
    final ExamSession examSession,
    final PartialExamType partialExamType
  ) {
    return registrationRepository.findConflictingRegistrations(
      identity.getId(),
      examSession.getExamDate().getId(),
      examSession.getId(),
      partialExamType.name()
    );
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

  @Transactional
  public PublicRegistrationSubmitResponseDTO submitRegistration(
    final Identity identity,
    final long registrationId,
    final String lang,
    final PublicRegistrationFormDTO formDTO
  ) {
    LOG.info("START: Submitting registration id {}", registrationId);

    // Step 1: Load registration and verify it belongs to the identity and is in STARTED state
    final Registration registration = registrationRepository.findById(registrationId)
      .orElseThrow(() -> new APIException(APIExceptionType.NOT_FOUND));

    if (registration.getIdentity() == null || registration.getIdentity().getId() != identity.getId()) {
      throw new APIException(APIExceptionType.REGISTRATION_NOT_OWNED);
    }

    if (registration.getState() != RegistrationState.STARTED) {
      throw new APIException(APIExceptionType.REGISTRATION_NOT_STARTED);
    }

    // Step 2: Persist form data to registration
    registration.setForm(buildFormJson(formDTO));
    registrationRepository.saveAndFlush(registration);

    // Step 3: Get or create person in ONR (oppijanumerorekisteri)
    // TODO: call OnrService to get or create person with form data
    //   Returns person OID
    //   (see: onr/get-or-create-person in registration.clj)

    // Step 4: Upsert person in local person table
    // TODO: call PersonRepository to upsert person with oid, name, gender, nationality
    //   (see: person-db/upsert-person! in registration.clj)

    // Step 5: Determine submitted state
    //   QUEUE registrations → SUBMITTED
    //   ADMISSION with free registration → COMPLETED
    //   ADMISSION without free registration → SUBMITTED
    // TODO: validate free_registration_id if provided
    //   (see: validate-free-registration in registration.clj)
    final RegistrationState submittedState = resolveSubmittedState(registration, formDTO.freeRegistrationId());

    // Step 6: Update registration details
    //   Set state, form, person_oid, expires_at
    // TODO: set registration fields and save
    //   (see: update-registration-details! in registration_db.clj)

    // Step 7: Create payment link or send free registration email
    //   ADMISSION + not free → create payment link and send payment email
    //   ADMISSION + free → send free registration confirmation email
    //   QUEUE → send enrolled-to-queue email
    // TODO: implement payment link creation and email sending
    //   (see: create-and-send-payment-link, send-free-registration-email in registration.clj)

    // Step 8: Insert change event
    // TODO: insert registration change event with event=SUBMIT

    final String code = registration.getKind() == RegistrationKind.ADMISSION
      ? java.util.UUID.randomUUID().toString()
      : null;

    LOG.info("END: Registration id {} submitted successfully", registrationId);

    return PublicRegistrationSubmitResponseDTO
      .builder()
      .success(true)
      .registrationKind(registration.getKind())
      .state(submittedState)
      .code(code)
      .build();
  }

  private ObjectNode buildFormJson(final PublicRegistrationFormDTO form) {
    final ObjectNode node = OBJECT_MAPPER.createObjectNode();
    node.put("first_name", form.firstName());
    node.put("last_name", form.lastName());
    node.put("email", form.email());
    node.put("phone_number", form.phoneNumber());
    node.put("street_address", form.streetAddress());
    node.put("zip", form.zip());
    node.put("post_office", form.postOffice());
    node.put("certificate_lang", form.certificateLang());
    node.put("exam_lang", form.examLang());

    if (form.birthdate() != null) {
      node.put("birthdate", form.birthdate());
    }
    if (form.gender() != null) {
      node.put("gender", form.gender());
    }
    if (form.nationalityDesc() != null) {
      node.put("nationality_desc", form.nationalityDesc());
    }
    if (form.countryCode() != null) {
      node.put("country_code", form.countryCode());
    }
    if (form.nativeLanguage() != null) {
      node.put("native_language", form.nativeLanguage());
    }
    if (form.preferredName() != null) {
      node.put("preferred_name", form.preferredName());
    }
    if (form.nationalities() != null) {
      final ArrayNode arr = OBJECT_MAPPER.createArrayNode();
      form.nationalities().forEach(arr::add);
      node.set("nationalities", arr);
    }

    return node;
  }

  private RegistrationState resolveSubmittedState(final Registration registration, final Long freeRegistrationId) {
    if (registration.getKind() == RegistrationKind.QUEUE) {
      return RegistrationState.SUBMITTED;
    }

    // TODO: validate freeRegistrationId against DB free_registration record
    if (freeRegistrationId != null) {
      return RegistrationState.COMPLETED;
    }

    return RegistrationState.SUBMITTED;
  }

  @Transactional(readOnly = true)
  public PublicRegistrationDetailsDTO getRegistrationDetails(final Identity identity, final long registrationId) {
    final Registration registration = registrationRepository.findById(registrationId)
      .orElseThrow(() -> new APIException(APIExceptionType.NOT_FOUND));

    if (registration.getIdentity() == null || registration.getIdentity().getId() != identity.getId()) {
      throw new APIException(APIExceptionType.REGISTRATION_NOT_OWNED);
    }

    final ExamSession examSession = registration.getExamSession();

    return PublicRegistrationDetailsDTO
      .builder()
      .id(registration.getId())
      .kind(registration.getKind())
      .partialExamType(registration.getPartialExamType())
      .state(registration.getState())
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
      .build();
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
