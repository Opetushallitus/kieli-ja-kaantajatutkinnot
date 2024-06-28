package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.api.dto.FreeEnrollmentDetailsDTO;
import fi.oph.vkt.api.dto.PublicEducationDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentInitialisationDTO;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.FeatureFlag;
import fi.oph.vkt.model.FreeEnrollment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.UploadedFileAttachment;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.model.type.FreeEnrollmentType;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.FreeEnrollmentRepository;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.repository.UploadedFileAttachmentRepository;
import fi.oph.vkt.service.aws.S3Service;
import fi.oph.vkt.service.koski.KoskiService;
import fi.oph.vkt.util.EnrollmentUtil;
import fi.oph.vkt.util.ExamEventUtil;
import fi.oph.vkt.util.PersonUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
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
  private final UploadedFileAttachmentRepository uploadedFileAttachmentRepository;
  private final KoskiService koskiService;

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

    final FreeEnrollmentDetailsDTO freeEnrollmentDetailsDTO = optionalPublicFreeEnrollmentDetails
      .map(e ->
        FreeEnrollmentDetailsDTO
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

  @Transactional
  protected FreeEnrollment saveFreeEnrollment(final Person person, final PublicEnrollmentCreateDTO dto)
    throws APIException {
    final FreeEnrollmentSource reason = dto.freeEnrollmentBasis().source();
    final FreeEnrollmentType type = dto.freeEnrollmentBasis().type();

    if (reason.equals(FreeEnrollmentSource.KOSKI) && person.getOid() != null && !person.getOid().isEmpty()) {
      final List<PublicEducationDTO> educations = koskiService.findEducations(person.getOid());

      if (educations.isEmpty()) {
        throw new APIException(APIExceptionType.KOSKI_DATA_MISMATCH);
      }
    } else if (dto.freeEnrollmentBasis().attachments() != null && dto.freeEnrollmentBasis().attachments().isEmpty()) {
      throw new APIException(APIExceptionType.USER_ATTACHMENTS_MISSING);
    }

    final FreeEnrollment freeEnrollment = new FreeEnrollment();
    freeEnrollment.setApproved(reason.equals(FreeEnrollmentSource.KOSKI) ? true : null);
    freeEnrollment.setPerson(person);
    freeEnrollment.setSource(reason);
    freeEnrollment.setType(type);
    freeEnrollmentRepository.saveAndFlush(freeEnrollment);

    if (dto.freeEnrollmentBasis().attachments() != null) {
      // TODO Validate attachment metadata before persisting freeEnrollment
      // - Ensure that user is only able to reference attachments uploaded by themselves
      // - Ensure that object key (attachmentDTO.id()) is prefixed by the correct enrollment id and
      //   correct person UUID
      final List<UploadedFileAttachment> attachments = dto
        .freeEnrollmentBasis()
        .attachments()
        .stream()
        .map(attachmentDTO -> {
          final UploadedFileAttachment attachment = new UploadedFileAttachment();
          attachment.setFilename(attachmentDTO.name());
          attachment.setKey(attachmentDTO.id());
          attachment.setSize(attachmentDTO.size());
          attachment.setFreeEnrollment(freeEnrollment);
          uploadedFileAttachmentRepository.saveAndFlush(attachment);

          return attachment;
        })
        .collect(Collectors.toList());

      freeEnrollment.setAttachments(attachments);
      freeEnrollmentRepository.saveAndFlush(freeEnrollment);
    }

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
    final EnrollmentStatus status = createFreeEnrollmentNextStatus(freeEnrollment, person, dto);
    final Enrollment enrollment = createOrUpdateExistingEnrollment(dto, examEvent, person, status, freeEnrollment);
    reservationRepository.deleteById(reservationId);

    publicEnrollmentEmailService.sendFreeEnrollmentConfirmationEmail(enrollment, person);

    return createEnrollmentDTO(enrollment);
  }

  @Transactional(readOnly = true)
  protected EnrollmentStatus createFreeEnrollmentNextStatus(
    final FreeEnrollment freeEnrollment,
    final Person person,
    final PublicEnrollmentCreateDTO dto
  ) {
    final FreeEnrollmentDetails freeEnrollmentDetails = enrollmentRepository.countEnrollmentsByPerson(person);

    if (
      (dto.textualSkill() && freeEnrollmentDetails.textualSkillCount() >= EnrollmentUtil.FREE_ENROLLMENT_LIMIT) ||
      (dto.oralSkill() && freeEnrollmentDetails.oralSkillCount() >= EnrollmentUtil.FREE_ENROLLMENT_LIMIT)
    ) {
      return EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT;
    }

    return freeEnrollment.getSource().equals(FreeEnrollmentSource.KOSKI)
      ? EnrollmentStatus.COMPLETED
      : EnrollmentStatus.AWAITING_APPROVAL;
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

    FreeEnrollment freeEnrollment = null;
    EnrollmentStatus status = EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT;
    if (
      dto.freeEnrollmentBasis() != null &&
      featureFlagService.isEnabled(FeatureFlag.FREE_ENROLLMENT_FOR_HIGHEST_LEVEL_ALLOWED)
    ) {
      freeEnrollment = saveFreeEnrollment(person, dto);
      status = createFreeEnrollmentNextStatus(freeEnrollment, person, dto);
    }

    final Enrollment enrollment = createOrUpdateExistingEnrollment(dto, examEvent, person, status, freeEnrollment);

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

    // TODO Instead of filename, use a UUID + file type extension as the key suffix.
    final String key = examEventId + "/" + person.getUuid() + "/" + filename;
    // TODO Record a database entry per presigned POST request
    // Later, validate attachment metadata submitted as part of enrollment against
    // the recorded entries.
    return s3Service.getPresignedPostRequest(key);
  }
}
