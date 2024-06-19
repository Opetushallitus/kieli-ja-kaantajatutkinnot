package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentInitialisationDTO;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicFreeEnrollmentDetailsDTO;
import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.FeatureFlag;
import fi.oph.vkt.model.FreeEnrollment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.FreeEnrollmentRepository;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.service.aws.S3Service;
import fi.oph.vkt.util.ExamEventUtil;
import fi.oph.vkt.util.PersonUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicEnrollmentService extends AbstractEnrollmentService {

  private final EnrollmentRepository enrollmentRepository;
  private final ExamEventRepository examEventRepository;
  private final PublicEnrollmentEmailService publicEnrollmentEmailService;
  private final PublicReservationService publicReservationService;
  private final ReservationRepository reservationRepository;
  private final FreeEnrollmentRepository freeEnrollmentRepository;
  private final S3Service s3Service;
  private final FeatureFlagService featureFlagService;

  @Transactional
  public PublicEnrollmentInitialisationDTO initialiseEnrollment(final long examEventId, final Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);

    // Should be done before computing the amount of openings
    cancelPotentialUnfinishedEnrollment(examEvent, person);

    final long openings = ExamEventUtil.getOpenings(examEvent);
    if (openings <= 0) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_IS_FULL);
    }
    if (ExamEventUtil.isCongested(examEvent)) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_HAS_CONGESTION);
    }
    if (examEvent.getRegistrationCloses().isBefore(LocalDate.now())) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_REGISTRATION_CLOSED);
    }
    if (isPersonEnrolled(examEvent, person, enrollmentRepository)) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_DUPLICATE_PERSON);
    }

    final PublicReservationDTO reservationDTO = publicReservationService.createOrReplaceReservation(examEvent, person);
    final Optional<FreeEnrollmentDetails> optionalPublicFreeEnrollmentDetails = featureFlagService.isEnabled(
        FeatureFlag.FREE_ENROLLMENT_FOR_HIGHEST_LEVEL_ALLOWED
      )
      ? Optional.of(enrollmentRepository.countEnrollmentsByPerson(person))
      : Optional.empty();

    return createEnrollmentInitialisationDTO(
      examEvent,
      person,
      openings,
      Optional.of(reservationDTO),
      Optional.empty(),
      optionalPublicFreeEnrollmentDetails
    );
  }

  private void cancelPotentialUnfinishedEnrollment(final ExamEvent examEvent, final Person person) {
    findEnrollment(examEvent, person, enrollmentRepository)
      .filter(Enrollment::isUnfinished)
      .ifPresent(enrollment -> {
        enrollment.setStatus(EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT);
        enrollmentRepository.saveAndFlush(enrollment);
      });
  }

  @Transactional(readOnly = true)
  public PublicEnrollmentInitialisationDTO getEnrollmentInitialisationDTO(final long examEventId, final Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final long openings = ExamEventUtil.getOpenings(examEvent);

    final Optional<PublicReservationDTO> optionalReservationDTO = reservationRepository
      .findByExamEventAndPerson(examEvent, person)
      .map(publicReservationService::createReservationDTO);

    final Optional<PublicEnrollmentDTO> optionalEnrollmentDTO = findEnrollment(examEvent, person, enrollmentRepository)
      .map(this::createEnrollmentDTO);

    final Optional<FreeEnrollmentDetails> optionalPublicFreeEnrollmentDetails = featureFlagService.isEnabled(
        FeatureFlag.FREE_ENROLLMENT_FOR_HIGHEST_LEVEL_ALLOWED
      )
      ? Optional.of(enrollmentRepository.countEnrollmentsByPerson(person))
      : Optional.empty();

    return createEnrollmentInitialisationDTO(
      examEvent,
      person,
      openings,
      optionalReservationDTO,
      optionalEnrollmentDTO,
      optionalPublicFreeEnrollmentDetails
    );
  }

  private PublicEnrollmentDTO createEnrollmentDTO(final Enrollment enrollment) {
    return PublicEnrollmentDTO
      .builder()
      .id(enrollment.getId())
      .oralSkill(enrollment.isOralSkill())
      .textualSkill(enrollment.isTextualSkill())
      .understandingSkill(enrollment.isUnderstandingSkill())
      .speakingPartialExam(enrollment.isSpeakingPartialExam())
      .speechComprehensionPartialExam(enrollment.isSpeechComprehensionPartialExam())
      .writingPartialExam(enrollment.isWritingPartialExam())
      .readingComprehensionPartialExam(enrollment.isReadingComprehensionPartialExam())
      .status(enrollment.getStatus())
      .previousEnrollment(enrollment.getPreviousEnrollment())
      .digitalCertificateConsent(enrollment.isDigitalCertificateConsent())
      .email(enrollment.getEmail())
      .phoneNumber(enrollment.getPhoneNumber())
      .street(enrollment.getStreet())
      .postalCode(enrollment.getPostalCode())
      .town(enrollment.getTown())
      .country(enrollment.getCountry())
      .hasPaymentLink(enrollment.getPaymentLinkHash() != null)
      .build();
  }

  private PublicEnrollmentInitialisationDTO createEnrollmentInitialisationDTO(
    final ExamEvent examEvent,
    final Person person,
    final long openings,
    final Optional<PublicReservationDTO> optionalReservationDTO,
    final Optional<PublicEnrollmentDTO> optionalEnrollmentDTO,
    final Optional<FreeEnrollmentDetails> optionalPublicFreeEnrollmentDetails
  ) {
    final PublicExamEventDTO examEventDTO = PublicExamEventDTO
      .builder()
      .id(examEvent.getId())
      .language(examEvent.getLanguage())
      .date(examEvent.getDate())
      .registrationCloses(examEvent.getRegistrationCloses())
      .openings(openings)
      .hasCongestion(false)
      .build();

    final PublicPersonDTO personDTO = PersonUtil.createPublicPersonDTO(person);

    final PublicFreeEnrollmentDetailsDTO freeEnrollmentDetailsDTO = optionalPublicFreeEnrollmentDetails
      .map(e ->
        PublicFreeEnrollmentDetailsDTO
          .builder()
          .freeOralSkillLeft(Math.max(0, 3 - e.oralSkillCount()))
          .freeTextualSkillLeft(Math.max(0, 3 - e.textualSkillCount()))
          .build()
      )
      .orElse(null);

    return PublicEnrollmentInitialisationDTO
      .builder()
      .examEvent(examEventDTO)
      .person(personDTO)
      .reservation(optionalReservationDTO.orElse(null))
      .enrollment(optionalEnrollmentDTO.orElse(null))
      .freeEnrollmentDetails(freeEnrollmentDetailsDTO)
      .build();
  }

  @Transactional
  public PublicEnrollmentInitialisationDTO initialiseEnrollmentToQueue(final long examEventId, final Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);

    if (hasPersonUnfinishedPayment(examEvent, person, enrollmentRepository)) {
      return initialiseEnrollment(examEventId, person);
    }

    final long openings = ExamEventUtil.getOpenings(examEvent);
    if (openings > 0) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_TO_QUEUE_HAS_ROOM);
    }
    if (examEvent.getRegistrationCloses().isBefore(LocalDate.now())) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_REGISTRATION_CLOSED);
    }
    if (isPersonEnrolled(examEvent, person, enrollmentRepository)) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_DUPLICATE_PERSON);
    }

    final Optional<FreeEnrollmentDetails> optionalPublicFreeEnrollmentDetails = featureFlagService.isEnabled(
        FeatureFlag.FREE_ENROLLMENT_FOR_HIGHEST_LEVEL_ALLOWED
      )
      ? Optional.of(enrollmentRepository.countEnrollmentsByPerson(person))
      : Optional.empty();

    return createEnrollmentInitialisationDTO(
      examEvent,
      person,
      openings,
      Optional.empty(),
      Optional.empty(),
      optionalPublicFreeEnrollmentDetails
    );
  }

  private FreeEnrollment saveFreeEnrollment(final Person person, final PublicEnrollmentCreateDTO dto)
    throws APIException {
    // TODO validate that enrollment is actually free
    // - read user provided reason for free enrollment
    // - depending on choice:
    //   *  check saved Koski-data
    //   *  check that enrollment contains uploaded files

    final FreeEnrollmentSource reason = dto.freeEnrollmentBasis().source().equals("KOSKI")
      ? FreeEnrollmentSource.KOSKI
      : FreeEnrollmentSource.USER;

    final FreeEnrollmentDetails freeEnrollmentDetails = enrollmentRepository.countEnrollmentsByPerson(person);
    if (freeEnrollmentDetails.textualSkillCount() >= 3 || freeEnrollmentDetails.oralSkillCount() >= 3) {
      throw new APIException(APIExceptionType.FREE_ENROLLMENT_ALL_USED);
    }

    final FreeEnrollment freeEnrollment = new FreeEnrollment();
    freeEnrollment.setApproved(reason.equals(FreeEnrollmentSource.KOSKI));
    freeEnrollment.setPerson(person);
    freeEnrollment.setSource(reason);
    freeEnrollmentRepository.saveAndFlush(freeEnrollment);

    return freeEnrollment;
  }

  @Transactional
  public PublicEnrollmentDTO createEnrollment(
    final PublicEnrollmentCreateDTO dto,
    final long reservationId,
    final Person person
  ) {
    final Reservation reservation = reservationRepository.getReferenceById(reservationId);
    final ExamEvent examEvent = reservation.getExamEvent();

    if (person.getId() != reservation.getPerson().getId()) {
      throw new APIException(APIExceptionType.RESERVATION_PERSON_SESSION_MISMATCH);
    }

    final Enrollment enrollment = createOrUpdateExistingEnrollment(
      dto,
      examEvent,
      person,
      EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT,
      null
    );
    reservationRepository.deleteById(reservationId);

    return createEnrollmentDTO(enrollment);
  }

  @Transactional
  public PublicEnrollmentDTO createFreeEnrollment(
    final PublicEnrollmentCreateDTO dto,
    final long reservationId,
    final Person person
  ) {
    final Reservation reservation = reservationRepository.getReferenceById(reservationId);
    final ExamEvent examEvent = reservation.getExamEvent();

    if (person.getId() != reservation.getPerson().getId()) {
      throw new APIException(APIExceptionType.RESERVATION_PERSON_SESSION_MISMATCH);
    }

    final FreeEnrollment freeEnrollment = saveFreeEnrollment(person, dto);

    final Enrollment enrollment = createOrUpdateExistingEnrollment(
      dto,
      examEvent,
      person,
      EnrollmentStatus.AWAITING_APPROVAL,
      freeEnrollment
    );
    reservationRepository.deleteById(reservationId);

    // TODO send confirmation email

    return createEnrollmentDTO(enrollment);
  }

  private Enrollment createOrUpdateExistingEnrollment(
    final PublicEnrollmentCreateDTO dto,
    final ExamEvent examEvent,
    final Person person,
    final EnrollmentStatus enrollmentStatus,
    final FreeEnrollment freeEnrollment
  ) {
    final Enrollment enrollment = findEnrollment(examEvent, person, enrollmentRepository).orElse(new Enrollment());
    enrollment.setExamEvent(examEvent);
    enrollment.setPerson(person);
    enrollment.setStatus(enrollmentStatus);
    enrollment.setFreeEnrollment(freeEnrollment != null ? freeEnrollment : enrollment.getFreeEnrollment());

    copyDtoFieldsToEnrollment(enrollment, dto);
    if (dto.digitalCertificateConsent()) {
      clearAddress(enrollment);
    }

    return enrollmentRepository.saveAndFlush(enrollment);
  }

  private void clearAddress(final Enrollment enrollment) {
    enrollment.setStreet(null);
    enrollment.setPostalCode(null);
    enrollment.setTown(null);
    enrollment.setCountry(null);
  }

  @Transactional
  public PublicEnrollmentDTO createEnrollmentToQueue(
    final PublicEnrollmentCreateDTO dto,
    final long examEventId,
    final Person person
  ) {
    FreeEnrollment freeEnrollment = null;
    if (dto.isFree() && featureFlagService.isEnabled(FeatureFlag.FREE_ENROLLMENT_FOR_HIGHEST_LEVEL_ALLOWED)) {
      freeEnrollment = saveFreeEnrollment(person, dto);
    }
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final Enrollment enrollment = createOrUpdateExistingEnrollment(
      dto,
      examEvent,
      person,
      EnrollmentStatus.QUEUED,
      freeEnrollment
    );

    publicEnrollmentEmailService.sendEnrollmentToQueueConfirmationEmail(enrollment, person);

    return createEnrollmentDTO(enrollment);
  }

  @Transactional(readOnly = true)
  public Enrollment getEnrollmentByExamEventAndPaymentLink(final long examEventId, final String paymentLinkHash) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);

    final Enrollment enrollment = enrollmentRepository
      .findByExamEventAndPaymentLinkHash(examEvent, paymentLinkHash)
      .orElseThrow(() -> new NotFoundException("Enrollment not found"));

    final LocalDateTime expiresAt = enrollment.getPaymentLinkExpiresAt();

    if (enrollment.getStatus() != EnrollmentStatus.AWAITING_PAYMENT) {
      throw new APIException(APIExceptionType.PAYMENT_LINK_INVALID_ENROLLMENT_STATUS);
    }
    if (expiresAt == null || expiresAt.isBefore(LocalDateTime.now())) {
      throw new APIException(APIExceptionType.PAYMENT_LINK_HAS_EXPIRED);
    }

    return enrollment;
  }

  @Transactional
  public PublicEnrollmentDTO updateEnrollmentForPayment(
    final PublicEnrollmentCreateDTO dto,
    final long examEventId,
    final Person person
  ) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final Enrollment enrollment = createOrUpdateExistingEnrollment(
      dto,
      examEvent,
      person,
      EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT,
      null
    );

    return createEnrollmentDTO(enrollment);
  }

  @Transactional
  public PublicEnrollmentDTO updateEnrollmentForFree(
    final PublicEnrollmentCreateDTO dto,
    final long examEventId,
    final Person person
  ) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);

    FreeEnrollment freeEnrollment = null;
    if (dto.isFree() && featureFlagService.isEnabled(FeatureFlag.FREE_ENROLLMENT_FOR_HIGHEST_LEVEL_ALLOWED)) {
      freeEnrollment = saveFreeEnrollment(person, dto);
    }

    final Enrollment enrollment = createOrUpdateExistingEnrollment(
      dto,
      examEvent,
      person,
      EnrollmentStatus.AWAITING_APPROVAL,
      freeEnrollment
    );

    return createEnrollmentDTO(enrollment);
  }

  @Transactional(readOnly = true)
  public Map<String, String> getPresignedPostRequest(
    final long examEventId,
    final Person person,
    final String filename
  ) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);

    // Allow uploading only if person is actively trying to enroll or make a reservation
    boolean uploadAllowed = false;
    final Optional<Enrollment> enrollment = findEnrollment(examEvent, person, enrollmentRepository);
    if (enrollment.isPresent()) {
      uploadAllowed = enrollment.get().isExpectingPayment();
    }
    if (!uploadAllowed) {
      final Optional<Reservation> reservation = reservationRepository.findByExamEventAndPerson(examEvent, person);
      if (reservation.isPresent()) {
        uploadAllowed = reservation.get().isActive();
      }
    }
    if (!uploadAllowed) {
      throw new NotFoundException("No unfinished enrollment or reservation for exam event found");
    }

    final String key = examEventId + "/" + person.getUuid() + "/" + filename;
    return s3Service.getPresignedPostRequest(key);
  }
}
