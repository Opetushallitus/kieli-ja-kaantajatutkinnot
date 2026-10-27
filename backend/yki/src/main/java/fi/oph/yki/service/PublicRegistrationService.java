package fi.oph.yki.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fi.oph.yki.api.dto.PublicExamSessionContactDTO;
import fi.oph.yki.api.dto.PublicExamSessionDTO;
import fi.oph.yki.api.dto.PublicExamSessionLocationDTO;
import fi.oph.yki.api.dto.PublicOtherExamSessionRegistrationDTO;
import fi.oph.yki.api.dto.PublicRegistrationDetailsDTO;
import fi.oph.yki.api.dto.PublicRegistrationFormDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitErrorDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitResponseDTO;
import fi.oph.yki.api.dto.PublicRegistrationSubmitResponseDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.IdentityRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
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
  private final IdentityRepository identityRepository;
  private final PersonRepository personRepository;

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

    if (!isValidPartialExamType(examSession, partialExamType)) {
      throw new APIException(APIExceptionType.REGISTRATION_INVALID_PARTIAL_EXAM_TYPE);
    }

    final boolean toQueueRequested = Boolean.TRUE.equals(initDTO.toQueue());
    if (toQueueRequested && !isValidExamForQueue(examSession, partialExamType)) {
      throw new APIException(APIExceptionType.REGISTRATION_TO_QUEUE_NOT_ALLOWED);
    }

    if (!isRegistrationOpen(examSession)) {
      return buildErrorResponse(PublicRegistrationInitErrorDTO.builder().closed(true).build());
    }

    final List<Registration> conflicting = findConflictingRegistrations(identity, examSession, partialExamType);
    if (!conflicting.isEmpty()) {
      final Registration other = conflicting.get(0);
      final PublicOtherExamSessionRegistrationDTO otherDTO = PublicOtherExamSessionRegistrationDTO
        .builder()
        .id(other.getExamSession().getId())
        .registrationId(other.getId())
        .state(other.getState())
        .build();
      return buildErrorResponse(
        PublicRegistrationInitErrorDTO.builder().otherExamSessionRegistration(otherDTO).build()
      );
    }

    final boolean admissionAvailable =
      selectRegistrationKind(examSession, partialExamType) == RegistrationKind.ADMISSION;

    if (toQueueRequested && admissionAvailable) {
      throw new APIException(APIExceptionType.REGISTRATION_QUEUE_NOT_AVAILABLE);
    }

    if (!toQueueRequested && !admissionAvailable) {
      final boolean partialFull =
        !isValidExamForQueue(examSession, partialExamType) && anySubPartHasAdmission(examSession);
      return buildErrorResponse(
        PublicRegistrationInitErrorDTO.builder().full(true).toQueue(false).partialFull(partialFull).build()
      );
    }

    final Registration registration = createRegistration(
      initDTO.examSessionId(),
      identity,
      toQueueRequested ? RegistrationKind.QUEUE : RegistrationKind.ADMISSION,
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

  private boolean isValidExamForQueue(final ExamSession examSession, final PartialExamType partialExamType) {
    return examSession.getType() == ExamSessionType.FULL || partialExamType != PartialExamType.ALL_PARTS;
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

  private boolean anySubPartHasAdmission(final ExamSession examSession) {
    final List<PartialExamType> subParts = examSession.getType() == ExamSessionType.READ_SPEAK
      ? List.of(PartialExamType.READ, PartialExamType.SPEAK)
      : List.of(PartialExamType.LISTEN, PartialExamType.WRITE);

    return subParts
      .stream()
      .anyMatch(subPart -> selectRegistrationKind(examSession, subPart) == RegistrationKind.ADMISSION);
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
    final Registration registration = registrationRepository
      .findById(registrationId)
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

  @Transactional
  public Person createPersonForIdentity(
    final long identityId,
    final String personOid,
    final String firstName,
    final String lastName
  ) {
    final Identity identity = identityRepository
      .findById(identityId)
      .orElseThrow(() -> new APIException(APIExceptionType.NO_IDENTITY_SESSION));

    final Person person = personRepository
      .findById(personOid)
      .orElseGet(() -> {
        final Person newPerson = new Person();
        newPerson.setOid(personOid);
        newPerson.setFirstName(firstName);
        newPerson.setLastName(lastName);
        return personRepository.saveAndFlush(newPerson);
      });

    identity.setPerson(person);
    identity.setModifiedAt(LocalDateTime.now());
    identityRepository.save(identity);

    return person;
  }

  @Transactional(readOnly = true)
  public PublicRegistrationDetailsDTO getRegistrationDetails(final Identity identity, final long registrationId) {
    final Registration registration = registrationRepository
      .findById(registrationId)
      .orElseThrow(() -> new APIException(APIExceptionType.NOT_FOUND));

    if (registration.getIdentity() == null || registration.getIdentity().getId() != identity.getId()) {
      throw new APIException(APIExceptionType.REGISTRATION_NOT_OWNED);
    }

    return PublicRegistrationDetailsDTO
      .builder()
      .id(registration.getId())
      .kind(registration.getKind())
      .partialExamType(registration.getPartialExamType())
      .state(registration.getState())
      .examSession(buildExamSessionDTO(registration.getExamSession()))
      .build();
  }

  private PublicExamSessionDTO buildExamSessionDTO(final ExamSession examSession) {
    final ExamDate examDate = examSession.getExamDate();
    final List<String> allPartialExamTypes = Arrays.stream(PartialExamType.values()).map(Enum::name).toList();
    final boolean isPartialSession = examSession.getType() != ExamSessionType.FULL;

    return PublicExamSessionDTO
      .builder()
      .id(examSession.getId())
      .languageCode(examSession.getLanguage())
      .levelCode(examSession.getLevel())
      .type(examSession.getType())
      .sessionDate(examDate.getExamDate())
      .registrationStartDate(examDate.getRegistrationStartDate())
      .registrationEndDate(examDate.getRegistrationEndDate())
      .startTimeReadListen(examSession.getStartTimeReadListen())
      .startTimeSpeakWrite(examSession.getStartTimeSpeakWrite())
      .maxParticipants(examSession.getMaxParticipants())
      .maxParticipantsReadListen(examSession.getMaxParticipantsReadListen())
      .maxParticipantsSpeakWrite(examSession.getMaxParticipantsSpeakWrite())
      .participants(registrationRepository.countAdmissionRegistrations(examSession.getId(), allPartialExamTypes))
      .participantsReadListen(isPartialSession ? countPoolParticipants(examSession, true) : null)
      .participantsSpeakWrite(isPartialSession ? countPoolParticipants(examSession, false) : null)
      .queue(registrationRepository.countQueueRegistrations(examSession.getId(), allPartialExamTypes))
      .publishedAt(examSession.getPublishedAt())
      .location(examSession.getLocations().stream().map(this::buildLocationDTO).toList())
      .examFee(null)
      .availableRegistrationKind(selectRegistrationKind(examSession, PartialExamType.ALL_PARTS))
      .partialRegistrationKind(buildPartialRegistrationKinds(examSession))
      .officeOid(examSession.getOfficeOid())
      .organizerOid(examSession.getOrganizer().getOid())
      .contact(buildContactDTOs(examSession))
      .open(isRegistrationOpen(examSession))
      .upcomingAdmission(isUpcomingAdmission(examDate))
      .build();
  }

  private long countPoolParticipants(final ExamSession examSession, final boolean readListen) {
    final PartialExamType subPart = examSession.getType() == ExamSessionType.READ_SPEAK
      ? (readListen ? PartialExamType.READ : PartialExamType.SPEAK)
      : (readListen ? PartialExamType.LISTEN : PartialExamType.WRITE);

    return registrationRepository.countAdmissionRegistrations(
      examSession.getId(),
      List.of(PartialExamType.ALL_PARTS.name(), subPart.name())
    );
  }

  private Map<PartialExamType, RegistrationKind> buildPartialRegistrationKinds(final ExamSession examSession) {
    final List<PartialExamType> partialExamTypes =
      switch (examSession.getType()) {
        case FULL -> List.of(PartialExamType.ALL_PARTS);
        case READ_SPEAK -> List.of(PartialExamType.ALL_PARTS, PartialExamType.READ, PartialExamType.SPEAK);
        case LISTEN_WRITE -> List.of(PartialExamType.ALL_PARTS, PartialExamType.LISTEN, PartialExamType.WRITE);
      };
    final Map<PartialExamType, RegistrationKind> kinds = new LinkedHashMap<>();
    partialExamTypes.forEach(pet -> kinds.put(pet, selectRegistrationKind(examSession, pet)));

    return kinds;
  }

  private PublicExamSessionLocationDTO buildLocationDTO(final ExamSessionLocation location) {
    return PublicExamSessionLocationDTO
      .builder()
      .name(location.getName())
      .streetAddress(location.getStreetAddress())
      .postOffice(location.getPostOffice())
      .zip(location.getZip())
      .otherLocationInfo(location.getOtherLocationInfo())
      .extraInformation(location.getExtraInformation())
      .lang(location.getLang())
      .build();
  }

  private List<PublicExamSessionContactDTO> buildContactDTOs(final ExamSession examSession) {
    if (
      examSession.getContactName() == null &&
      examSession.getContactEmail() == null &&
      examSession.getContactPhoneNumber() == null
    ) {
      return List.of();
    }

    return List.of(
      PublicExamSessionContactDTO
        .builder()
        .name(examSession.getContactName())
        .email(examSession.getContactEmail())
        .phoneNumber(examSession.getContactPhoneNumber())
        .build()
    );
  }

  private boolean isUpcomingAdmission(final ExamDate examDate) {
    final ZoneId helsinki = ZoneId.of("Europe/Helsinki");
    final ZonedDateTime admissionEnd = examDate.getRegistrationEndDate().atTime(16, 0).atZone(helsinki);

    return ZonedDateTime.now(helsinki).isBefore(admissionEnd);
  }

  private PublicRegistrationInitResponseDTO buildResponse(final Registration registration) {
    final ExamSession examSession = registration.getExamSession();

    return PublicRegistrationInitResponseDTO.builder().registrationId(registration.getId()).build();
  }

  private PublicRegistrationInitResponseDTO buildErrorResponse(final PublicRegistrationInitErrorDTO error) {
    return PublicRegistrationInitResponseDTO.builder().error(error).build();
  }
}
