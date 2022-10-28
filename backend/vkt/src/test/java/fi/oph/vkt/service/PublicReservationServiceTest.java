package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class PublicReservationServiceTest {

  private static final Duration ONE_MINUTE = Duration.ofMinutes(1);

  @Resource
  private ExamEventRepository examEventRepository;

  @Resource
  private ReservationRepository reservationRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicReservationService publicReservationService;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);
    when(environment.getRequiredProperty("app.reservation.duration")).thenReturn(ONE_MINUTE.toString());

    publicReservationService = new PublicReservationService(examEventRepository, reservationRepository, environment);
  }

  @Test
  public void testCreateReservationToExamEventWithRoom() {
    final ExamEvent examEvent = createExamEvent(2);
    createEnrollment(examEvent, EnrollmentStatus.PAID);
    createEnrollment(examEvent, EnrollmentStatus.CANCELED);
    final Person person = createPerson();

    final PublicReservationDTO dto = publicReservationService.createReservation(examEvent.getId(), person);
    assertReservationDTO(examEvent, person, 1, dto);

    assertTrue(reservationRepository.findById(dto.id()).isPresent());
  }

  @Test
  public void testCreateReservationToFullExamEvent() {
    final ExamEvent examEvent = createExamEvent(2);
    createEnrollment(examEvent, EnrollmentStatus.PAID);
    createEnrollment(examEvent, EnrollmentStatus.EXPECTING_PAYMENT);
    final Person person = createPerson();

    final PublicReservationDTO dto = publicReservationService.createReservation(examEvent.getId(), person);
    assertReservationDTO(examEvent, person, 2, dto);

    assertTrue(reservationRepository.findById(dto.id()).isPresent());
  }

  @Test
  public void testCreateReservationToExamEventWithExpiredReservations() {
    final ExamEvent examEvent = createExamEvent(1);
    createReservation(examEvent, LocalDateTime.now());
    createReservation(examEvent, LocalDateTime.now().minusDays(1));
    final Person person = createPerson();

    final PublicReservationDTO dto = publicReservationService.createReservation(examEvent.getId(), person);
    assertReservationDTO(examEvent, person, 0, dto);

    assertTrue(reservationRepository.findById(dto.id()).isPresent());
  }

  @Test
  public void testCreateReservationShouldUpdateExpiresAtForExistingReservation() {
    final ExamEvent examEvent = createExamEvent(1);
    final Reservation reservation = createReservation(examEvent, LocalDateTime.now().minusDays(1));
    final Person person = reservation.getPerson();

    final PublicReservationDTO dto = publicReservationService.createReservation(examEvent.getId(), person);
    assertReservationDTO(examEvent, person, 0, dto);

    assertTrue(reservationRepository.findById(dto.id()).isPresent());
    assertEquals(1, reservationRepository.count());
  }

  @Test
  public void testCreateReservationWithCongestion() {
    final ExamEvent examEvent = createExamEvent(1);
    createReservation(examEvent, LocalDateTime.now().plusMinutes(1));
    final Person person = createPerson();

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicReservationService.createReservation(examEvent.getId(), person)
    );
    assertEquals(APIExceptionType.CREATE_RESERVATION_CONGESTION, ex.getExceptionType());
  }

  @Test
  public void testCreateReservationWithRegistrationClosed() {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setRegistrationCloses(LocalDate.now().minusDays(1));
    entityManager.persist(examEvent);
    final Person person = createPerson();

    final APIException ex = assertThrows(
      APIException.class,
      () -> publicReservationService.createReservation(examEvent.getId(), person)
    );
    assertEquals(APIExceptionType.CREATE_RESERVATION_REGISTRATION_CLOSED, ex.getExceptionType());
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

  private void assertReservationDTO(
    final ExamEvent examEvent,
    final Person person,
    final int participants,
    final PublicReservationDTO dto
  ) {
    final PublicExamEventDTO examEventDTO = dto.examEvent();
    assertEquals(examEvent.getId(), examEventDTO.id());
    assertEquals(examEvent.getLanguage(), examEventDTO.language());
    assertEquals(examEvent.getDate(), examEventDTO.date());
    assertEquals(examEvent.getRegistrationCloses(), examEventDTO.registrationCloses());
    assertEquals(participants, examEventDTO.participants());
    assertEquals(examEvent.getMaxParticipants(), examEventDTO.maxParticipants());

    final PublicPersonDTO personDTO = dto.person();
    assertEquals(person.getId(), personDTO.id());
    assertEquals(person.getIdentityNumber(), personDTO.identityNumber());
    assertEquals(person.getLastName(), personDTO.lastName());
    assertEquals(person.getFirstName(), person.getFirstName());

    final ZonedDateTime expectedExpiresAt = ZonedDateTime.of(
      LocalDateTime.now().plus(ONE_MINUTE),
      ZoneId.systemDefault()
    );
    assertTrue(dto.expiresAt().isAfter(expectedExpiresAt.minusSeconds(10)));
    assertTrue(dto.expiresAt().isBefore(expectedExpiresAt.plusSeconds(1)));
  }
}
