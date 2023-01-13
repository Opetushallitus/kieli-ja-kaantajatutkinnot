package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.util.exception.NotFoundException;
import java.util.List;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
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
    publicReservationService = new PublicReservationService(reservationRepository);
  }

  @Test
  public void testDeleteReservation() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Reservation reservation = Factory.reservation(examEvent, person);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(reservation);

    publicReservationService.deleteReservation(reservation.getId());

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

    assertThrows(NotFoundException.class, () -> publicReservationService.deleteReservation(reservation.getId() + 1));

    assertEquals(List.of(reservation), reservationRepository.findAll());
  }
}
