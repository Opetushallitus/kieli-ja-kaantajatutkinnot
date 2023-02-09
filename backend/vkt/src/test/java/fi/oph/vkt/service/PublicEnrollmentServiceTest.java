package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentInitialisationDTO;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class PublicEnrollmentServiceTest {

  private static final Duration ONE_MINUTE = Duration.ofMinutes(1);

  @Resource
  private EnrollmentRepository enrollmentRepository;

  @Resource
  private ExamEventRepository examEventRepository;

  @Resource
  private PersonRepository personRepository;

  @Resource
  private ReservationRepository reservationRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicEnrollmentService publicEnrollmentService;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);
    when(environment.getRequiredProperty("app.reservation.duration")).thenReturn(ONE_MINUTE.toString());

    publicEnrollmentService =
      new PublicEnrollmentService(
        enrollmentRepository,
        examEventRepository,
        personRepository,
        reservationRepository,
        environment
      );
  }

  @Test
  public void testInitialiseEnrollmentToExamEventWithRoom() {
    final ExamEvent examEvent = createExamEvent(2);
    createEnrollment(examEvent, EnrollmentStatus.PAID);
    createEnrollment(examEvent, EnrollmentStatus.CANCELED);
    final Person person = createPerson();

    final PublicEnrollmentInitialisationDTO dto = publicEnrollmentService.initialiseEnrollment(
      examEvent.getId(),
      person
    );
    assertInitialisedEnrollmentDTO(examEvent, person, 1, true, dto);

    assertTrue(reservationRepository.findById(dto.reservation().id()).isPresent());
  }

  @Test
  public void testInitialiseEnrollmentToExamEventWithExpiredReservations() {
    final ExamEvent examEvent = createExamEvent(2);
    createReservation(examEvent, LocalDateTime.now());
    createReservation(examEvent, LocalDateTime.now().minusDays(1));
    final Person person = createPerson();

    final PublicEnrollmentInitialisationDTO dto = publicEnrollmentService.initialiseEnrollment(
      examEvent.getId(),
      person
    );
    assertInitialisedEnrollmentDTO(examEvent, person, 2, true, dto);

    assertTrue(reservationRepository.findById(dto.reservation().id()).isPresent());
  }

  @Test
  public void testInitialiseEnrollmentShouldUpdateExpiresAtForExistingReservation() {
    final ExamEvent examEvent = createExamEvent(2);
    final Reservation reservation = createReservation(examEvent, LocalDateTime.now().minusDays(1));
    final Person person = reservation.getPerson();

    final PublicEnrollmentInitialisationDTO dto = publicEnrollmentService.initialiseEnrollment(
      examEvent.getId(),
      person
    );
    assertInitialisedEnrollmentDTO(examEvent, person, 2, true, dto);

    assertTrue(reservationRepository.findById(dto.reservation().id()).isPresent());
  }

  @Test
  public void testInitialiseEnrollmentFailsToFullExamEvent() {
    final ExamEvent examEvent = createExamEvent(2);
    createEnrollment(examEvent, EnrollmentStatus.PAID);
    createEnrollment(examEvent, EnrollmentStatus.EXPECTING_PAYMENT);
    final Person person = createPerson();

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicEnrollmentService.initialiseEnrollment(examEvent.getId(), person)
    );
    assertEquals(APIExceptionType.INITIALISE_ENROLLMENT_IS_FULL, ex.getExceptionType());
  }

  @Test
  public void testInitialiseEnrollmentFailsToDuplicatePerson() {
    final ExamEvent examEvent = createExamEvent(2);
    final Enrollment enrollment = createEnrollment(examEvent, EnrollmentStatus.PAID);

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicEnrollmentService.initialiseEnrollment(examEvent.getId(), enrollment.getPerson())
    );
    assertEquals(APIExceptionType.INITIALISE_ENROLLMENT_DUPLICATE_PERSON, ex.getExceptionType());
  }

  @Test
  public void testInitialiseEnrollmentQueueFailsToDuplicatePerson() {
    final ExamEvent examEvent = createExamEvent(2);
    final Enrollment enrollment = createEnrollment(examEvent, EnrollmentStatus.PAID);
    createEnrollment(examEvent, EnrollmentStatus.PAID);

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicEnrollmentService.initialiseEnrollmentToQueue(examEvent.getId(), enrollment.getPerson())
    );
    assertEquals(APIExceptionType.INITIALISE_ENROLLMENT_DUPLICATE_PERSON, ex.getExceptionType());
  }

  @Test
  public void testInitialiseEnrollmentFailsWithQueue() {
    final ExamEvent examEvent = createExamEvent(2);
    createEnrollment(examEvent, EnrollmentStatus.QUEUED);
    final Person person = createPerson();

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicEnrollmentService.initialiseEnrollment(examEvent.getId(), person)
    );
    assertEquals(APIExceptionType.INITIALISE_ENROLLMENT_IS_FULL, ex.getExceptionType());
  }

  @Test
  public void testInitialiseEnrollmentFailsWithCongestion() {
    final ExamEvent examEvent = createExamEvent(1);
    createReservation(examEvent, LocalDateTime.now().plusMinutes(1));
    final Person person = createPerson();

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicEnrollmentService.initialiseEnrollment(examEvent.getId(), person)
    );
    assertEquals(APIExceptionType.INITIALISE_ENROLLMENT_HAS_CONGESTION, ex.getExceptionType());
  }

  @Test
  public void testInitialiseEnrollmentFailsWithRegistrationClosed() {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setRegistrationCloses(LocalDate.now().minusDays(1));
    entityManager.persist(examEvent);
    final Person person = createPerson();

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicEnrollmentService.initialiseEnrollment(examEvent.getId(), person)
    );
    assertEquals(APIExceptionType.INITIALISE_ENROLLMENT_REGISTRATION_CLOSED, ex.getExceptionType());
  }

  private ExamEvent createExamEvent(final int maxParticipants) {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setMaxParticipants(maxParticipants);
    entityManager.persist(examEvent);

    return examEvent;
  }

  private Enrollment createEnrollment(final ExamEvent examEvent, final EnrollmentStatus status) {
    final Person person = createPerson();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setStatus(status);
    entityManager.persist(enrollment);

    return enrollment;
  }

  private Reservation createReservation(final ExamEvent examEvent, final LocalDateTime expiresAt) {
    final Person person = createPerson();
    final Reservation reservation = Factory.reservation(examEvent, person);
    reservation.setExpiresAt(expiresAt);
    entityManager.persist(reservation);

    return reservation;
  }

  private Person createPerson() {
    final Person person = Factory.person();
    entityManager.persist(person);

    return person;
  }

  private void assertInitialisedEnrollmentDTO(
    final ExamEvent examEvent,
    final Person person,
    final int openings,
    final boolean isReservationPresent,
    final PublicEnrollmentInitialisationDTO dto
  ) {
    final PublicExamEventDTO examEventDTO = dto.examEvent();
    assertEquals(examEvent.getId(), examEventDTO.id());
    assertEquals(examEvent.getLanguage(), examEventDTO.language());
    assertEquals(examEvent.getDate(), examEventDTO.date());
    assertEquals(examEvent.getRegistrationCloses(), examEventDTO.registrationCloses());
    assertEquals(openings, examEventDTO.openings());
    assertFalse(examEventDTO.hasCongestion());

    final PublicPersonDTO personDTO = dto.person();
    assertEquals(person.getId(), personDTO.id());
    assertEquals(person.getIdentityNumber(), personDTO.identityNumber());
    assertEquals(person.getLastName(), personDTO.lastName());
    assertEquals(person.getFirstName(), person.getFirstName());

    if (isReservationPresent) {
      assertNotNull(dto.reservation());

      final ZonedDateTime expectedExpiresAt = ZonedDateTime.of(
        LocalDateTime.now().plus(ONE_MINUTE),
        ZoneId.systemDefault()
      );
      assertTrue(dto.reservation().expiresAt().isAfter(expectedExpiresAt.minusSeconds(10)));
      assertTrue(dto.reservation().expiresAt().isBefore(expectedExpiresAt.plusSeconds(1)));
    } else {
      assertNull(dto.reservation());
    }
  }

  @Test
  public void testInitialiseEnrollmentToQueue() {
    final ExamEvent examEvent = createExamEvent(1);
    createEnrollment(examEvent, EnrollmentStatus.PAID);
    final Person person = createPerson();

    final PublicEnrollmentInitialisationDTO dto = publicEnrollmentService.initialiseEnrollmentToQueue(
      examEvent.getId(),
      person
    );
    assertInitialisedEnrollmentDTO(examEvent, person, 0, false, dto);
  }

  @Test
  public void testInitialiseEnrollmentToQueueFailsWithRoom() {
    final ExamEvent examEvent = createExamEvent(1);
    final Person person = createPerson();

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicEnrollmentService.initialiseEnrollmentToQueue(examEvent.getId(), person)
    );
    assertEquals(APIExceptionType.INITIALISE_ENROLLMENT_TO_QUEUE_HAS_ROOM, ex.getExceptionType());
  }

  @Test
  public void testCreateEnrollmentWithDigitalCertificateConsent() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Reservation reservation = Factory.reservation(examEvent, person);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(reservation);

    final PublicEnrollmentCreateDTO dto = createDTOBuilder().digitalCertificateConsent(true).build();

    publicEnrollmentService.createEnrollment(dto, reservation.getId());
    assertCreatedEnrollment(EnrollmentStatus.PAID, dto);

    assertEquals(0, reservationRepository.count());
  }

  @Test
  public void testCreateEnrollmentWithoutDigitalCertificateConsent() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Reservation reservation = Factory.reservation(examEvent, person);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(reservation);

    final PublicEnrollmentCreateDTO dto = createDTOBuilder().digitalCertificateConsent(false).build();

    publicEnrollmentService.createEnrollment(dto, reservation.getId());
    assertCreatedEnrollment(EnrollmentStatus.PAID, dto);
  }

  private PublicEnrollmentCreateDTO.PublicEnrollmentCreateDTOBuilder createDTOBuilder() {
    return PublicEnrollmentCreateDTO
      .builder()
      .oralSkill(true)
      .textualSkill(false)
      .understandingSkill(true)
      .speakingPartialExam(true)
      .speechComprehensionPartialExam(true)
      .writingPartialExam(false)
      .readingComprehensionPartialExam(false)
      .previousEnrollment("11/2022")
      .email("test@tester")
      .phoneNumber("+358000111")
      .street("Katu 1")
      .postalCode("00000")
      .town("Kaupunki")
      .country("Maa");
  }

  private void assertCreatedEnrollment(final EnrollmentStatus expectedStatus, final PublicEnrollmentCreateDTO dto) {
    final List<Enrollment> enrollments = enrollmentRepository.findAll();
    assertEquals(1, enrollments.size());

    final Enrollment enrollment = enrollments.get(0);
    assertEquals(0L, enrollment.getVersion());
    assertEquals(dto.oralSkill(), enrollment.isOralSkill());
    assertEquals(dto.textualSkill(), enrollment.isTextualSkill());
    assertEquals(dto.understandingSkill(), enrollment.isUnderstandingSkill());
    assertEquals(dto.speakingPartialExam(), enrollment.isSpeakingPartialExam());
    assertEquals(dto.speechComprehensionPartialExam(), enrollment.isSpeechComprehensionPartialExam());
    assertEquals(dto.writingPartialExam(), enrollment.isWritingPartialExam());
    assertEquals(dto.readingComprehensionPartialExam(), enrollment.isReadingComprehensionPartialExam());
    assertEquals(dto.previousEnrollment(), enrollment.getPreviousEnrollment());
    assertEquals(dto.digitalCertificateConsent(), enrollment.isDigitalCertificateConsent());
    assertEquals(dto.email(), enrollment.getEmail());
    assertEquals(dto.phoneNumber(), enrollment.getPhoneNumber());
    assertEquals(expectedStatus, enrollment.getStatus());

    if (dto.digitalCertificateConsent()) {
      assertNull(enrollment.getStreet());
      assertNull(enrollment.getPostalCode());
      assertNull(enrollment.getTown());
      assertNull(enrollment.getCountry());
    } else {
      assertEquals(dto.street(), enrollment.getStreet());
      assertEquals(dto.postalCode(), enrollment.getPostalCode());
      assertEquals(dto.town(), enrollment.getTown());
      assertEquals(dto.country(), enrollment.getCountry());
    }
  }

  @Test
  public void testCreateEnrollmentToQueue() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();

    entityManager.persist(examEvent);
    entityManager.persist(person);

    final PublicEnrollmentCreateDTO dto = createDTOBuilder().digitalCertificateConsent(true).build();

    publicEnrollmentService.createEnrollmentToQueue(dto, examEvent.getId(), person.getId());
    assertCreatedEnrollment(EnrollmentStatus.QUEUED, dto);
  }
}
