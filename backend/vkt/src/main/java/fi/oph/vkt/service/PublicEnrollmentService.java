package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentInitialisationDTO;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.util.ExamEventUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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

  @Transactional
  public PublicEnrollmentInitialisationDTO initialiseEnrollment(final long examEventId, final Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final long openings = getOpenings(examEvent);
    final long reservations = examEvent.getReservations().stream().filter(Reservation::isActive).count();

    if (openings <= 0) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_IS_FULL);
    }
    if (ExamEventUtil.isCongested(openings, reservations)) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_HAS_CONGESTION);
    }
    if (examEvent.getRegistrationCloses().isBefore(LocalDate.now())) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_REGISTRATION_CLOSED);
    }
    if (isPersonEnrolled(examEvent, person, enrollmentRepository)) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_DUPLICATE_PERSON);
    }

    final PublicReservationDTO reservationDTO = publicReservationService.createOrReplaceReservation(examEvent, person);

    return createEnrollmentInitialisationDTO(
      examEvent,
      person,
      openings,
      Optional.of(reservationDTO),
      Optional.empty(),
      true
    );
  }

  private long getParticipants(final List<Enrollment> enrollments) {
    return enrollments
      .stream()
      .filter(e ->
        e.getStatus() == EnrollmentStatus.PAID ||
        e.getStatus() == EnrollmentStatus.SHIFTED_FROM_QUEUE ||
        e.getStatus() == EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT
      )
      .count();
  }

  private long getOpenings(final ExamEvent examEvent) {
    final List<Enrollment> enrollments = examEvent.getEnrollments();

    final long participants = getParticipants(enrollments);
    final boolean hasEnrollmentsToQueue = enrollments.stream().anyMatch(Enrollment::isEnrolledToQueue);

    return hasEnrollmentsToQueue ? 0L : examEvent.getMaxParticipants() - participants;
  }

  @Transactional(readOnly = true)
  public PublicEnrollmentInitialisationDTO getEnrollmentInitialisationDTO(final long examEventId, final Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final long openings = getOpenings(examEvent);

    final Optional<PublicReservationDTO> optionalReservationDTO = reservationRepository
      .findByExamEventAndPerson(examEvent, person)
      .map(publicReservationService::createReservationDTO);

    final Optional<PublicEnrollmentDTO> optionalEnrollmentDTO = findEnrollment(examEvent, person, enrollmentRepository)
      .map(this::createEnrollmentDTO);

    return createEnrollmentInitialisationDTO(
      examEvent,
      person,
      openings,
      optionalReservationDTO,
      optionalEnrollmentDTO,
      false
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
      .build();
  }

  private PublicEnrollmentInitialisationDTO createEnrollmentInitialisationDTO(
    final ExamEvent examEvent,
    final Person person,
    final long openings,
    final Optional<PublicReservationDTO> optionalReservationDTO,
    final Optional<PublicEnrollmentDTO> optionalEnrollmentDTO,
    final boolean includePersonIdentity
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

    final PublicPersonDTO personDTO = PublicPersonDTO
      .builder()
      .id(person.getId())
      .identityNumber(includePersonIdentity ? person.getIdentityNumber() : null)
      .dateOfBirth(includePersonIdentity ? person.getDateOfBirth() : null)
      .lastName(person.getLastName())
      .firstName(person.getFirstName())
      .build();

    return PublicEnrollmentInitialisationDTO
      .builder()
      .examEvent(examEventDTO)
      .person(personDTO)
      .reservation(optionalReservationDTO.orElse(null))
      .enrollment(optionalEnrollmentDTO.orElse(null))
      .build();
  }

  @Transactional(readOnly = true)
  public PublicEnrollmentInitialisationDTO initialiseEnrollmentToQueue(final long examEventId, final Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final long openings = getOpenings(examEvent);

    if (openings > 0) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_TO_QUEUE_HAS_ROOM);
    }
    if (examEvent.getRegistrationCloses().isBefore(LocalDate.now())) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_REGISTRATION_CLOSED);
    }
    if (isPersonEnrolled(examEvent, person, enrollmentRepository)) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_DUPLICATE_PERSON);
    }

    return createEnrollmentInitialisationDTO(examEvent, person, openings, Optional.empty(), Optional.empty(), true);
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
      EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT
    );
    reservationRepository.deleteById(reservationId);

    return createEnrollmentDTO(enrollment);
  }

  private Enrollment createOrUpdateExistingEnrollment(
    final PublicEnrollmentCreateDTO dto,
    final ExamEvent examEvent,
    final Person person,
    final EnrollmentStatus enrollmentStatus
  ) {
    final Enrollment enrollment = findEnrollment(examEvent, person, enrollmentRepository).orElse(new Enrollment());
    enrollment.setExamEvent(examEvent);
    enrollment.setPerson(person);
    enrollment.setStatus(enrollmentStatus);

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
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final Enrollment enrollment = createOrUpdateExistingEnrollment(dto, examEvent, person, EnrollmentStatus.QUEUED);

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

    if (expiresAt == null || expiresAt.isBefore(LocalDateTime.now())) {
      throw new APIException(APIExceptionType.PAYMENT_LINK_HAS_EXPIRED);
    }

    return enrollment;
  }
}
