package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import javax.annotation.Resource;
import javax.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class PublicReservationServiceTest {

  @Resource
  private ReservationRepository reservationRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicReservationService publicReservationService;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);
    when(environment.getRequiredProperty("app.reservation.duration")).thenReturn("PT30M");
    publicReservationService = new PublicReservationService(reservationRepository, environment);
  }

  @Test
  public void testRenewReservation() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Reservation reservation = Factory.reservation(examEvent, person);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(reservation);

    final LocalDateTime expires = reservation.getExpiresAt();

    publicReservationService.renewReservation(reservation.getId(), person);

    assertEquals(1, reservationRepository.count());
    assertNotEquals(expires, reservation.getExpiresAt());
  }

  @Test
  public void testRenewReservationTwice() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Reservation reservation = Factory.reservation(examEvent, person);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(reservation);

    final APIException ex = assertThrows(
      APIException.class,
      () -> {
        publicReservationService.renewReservation(reservation.getId(), person);
        publicReservationService.renewReservation(reservation.getId(), person);
      }
    );
    assertEquals(APIExceptionType.RENEW_RESERVATION_NOT_ALLOWED, ex.getExceptionType());
  }

  @Test
  public void testRenewReservationNotExist() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Reservation reservation = Factory.reservation(examEvent, person);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(reservation);

    assertThrows(
      EntityNotFoundException.class,
      () -> publicReservationService.renewReservation(reservation.getId() + 1, person)
    );
  }

  @Test
  public void testDeleteReservation() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Reservation reservation = Factory.reservation(examEvent, person);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(reservation);

    publicReservationService.deleteReservation(reservation.getId(), person);

    assertEquals(0, reservationRepository.count());
  }

  @Test
  public void testDeleteReservationWhichDoesNotExist() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Reservation reservation = Factory.reservation(examEvent, person);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(reservation);

    assertThrows(
      EntityNotFoundException.class,
      () -> publicReservationService.deleteReservation(reservation.getId() + 1, person)
    );

    assertEquals(List.of(reservation), reservationRepository.findAll());
  }
}
