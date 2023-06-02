package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.ReservationRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-hsql")
public class PublicExamEventServiceTest {

  @Resource
  private ExamEventRepository examEventRepository;

  @Resource
  private ReservationRepository reservationRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicExamEventService publicExamEventService;

  @BeforeEach
  public void setup() {
    publicExamEventService = new PublicExamEventService(examEventRepository, reservationRepository);
  }

  @Test
  public void testListExcellentLevelExamEvents() {
    final LocalDate now = LocalDate.now();

    final ExamEvent pastEvent = Factory.examEvent();
    pastEvent.setDate(now.minusWeeks(3));
    pastEvent.setRegistrationCloses(now.minusWeeks(4));

    final ExamEvent eventWithRegistrationClosed = Factory.examEvent();
    eventWithRegistrationClosed.setDate(now.plusDays(3));
    eventWithRegistrationClosed.setRegistrationCloses(now.minusDays(1));

    final ExamEvent hiddenEvent = Factory.examEvent();
    hiddenEvent.setHidden(true);
    hiddenEvent.setDate(now.plusWeeks(1));

    final ExamEvent eventToday = Factory.examEvent(ExamLanguage.FI);
    eventToday.setDate(now);
    eventToday.setMaxParticipants(6);

    final ExamEvent upcomingEventSv = Factory.examEvent(ExamLanguage.SV);
    final ExamEvent upcomingEventFi = Factory.examEvent(ExamLanguage.FI);

    final ExamEvent futureEvent1 = Factory.examEvent(ExamLanguage.SV);
    futureEvent1.setDate(now.plusWeeks(4));
    futureEvent1.setRegistrationCloses(now.plusWeeks(3));
    futureEvent1.setMaxParticipants(3);

    final ExamEvent futureEvent2 = Factory.examEvent(ExamLanguage.FI);
    futureEvent2.setDate(now.plusWeeks(5));
    futureEvent2.setRegistrationCloses(now.plusWeeks(3));
    futureEvent2.setMaxParticipants(4);

    final ExamEvent futureEventWithoutRoom = Factory.examEvent();
    futureEventWithoutRoom.setDate(now.plusWeeks(6));
    futureEventWithoutRoom.setMaxParticipants(0);

    entityManager.persist(pastEvent);
    entityManager.persist(eventWithRegistrationClosed);
    entityManager.persist(hiddenEvent);
    entityManager.persist(eventToday);
    entityManager.persist(upcomingEventSv);
    entityManager.persist(upcomingEventFi);
    entityManager.persist(futureEvent1);
    entityManager.persist(futureEvent2);
    entityManager.persist(futureEventWithoutRoom);

    createReservations(futureEvent1, 2, LocalDateTime.now().plusMinutes(1));
    createReservations(futureEvent1, 1, LocalDateTime.now());

    createEnrollment(futureEvent2, EnrollmentStatus.PAID);
    createEnrollment(futureEvent2, EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT);
    createEnrollment(futureEvent2, EnrollmentStatus.CANCELED);
    createReservations(futureEvent2, 2, LocalDateTime.now().plusMinutes(1));

    final List<PublicExamEventDTO> examEventDTOs = publicExamEventService.listExamEvents(ExamLevel.EXCELLENT);
    assertEquals(6, examEventDTOs.size());

    final List<ExamEvent> expectedExamEventsOrdered = List.of(
      eventToday,
      upcomingEventFi,
      upcomingEventSv,
      futureEvent1,
      futureEvent2,
      futureEventWithoutRoom
    );
    assertCorrectOrdering(expectedExamEventsOrdered, examEventDTOs);

    IntStream
      .range(0, expectedExamEventsOrdered.size())
      .forEach(i -> {
        final ExamEvent expected = expectedExamEventsOrdered.get(i);
        final PublicExamEventDTO dto = examEventDTOs.get(i);

        assertExamEventDetails(expected, dto);

        if (expected == futureEvent1) {
          assertEquals(3, dto.openings());
          assertFalse(dto.hasCongestion(), "futureEvent1 should not have congestion");
        } else if (expected == futureEvent2) {
          assertEquals(2, dto.openings());
          assertTrue(dto.hasCongestion(), "futureEvent2 should have congestion");
        } else {
          assertEquals(expected.getMaxParticipants(), dto.openings());
          assertFalse(dto.hasCongestion());
        }
      });
  }

  @Test
  public void testCongestion_0_0() {
    testCongestion(0, 0, false);
  }

  @Test
  public void testCongestion_0_1() {
    testCongestion(0, 1, false);
  }

  @Test
  public void testCongestion_0_2() {
    testCongestion(0, 2, true);
  }

  @Test
  public void testCongestion_0_3() {
    testCongestion(0, 3, true);
  }

  @Test
  public void testCongestion_1_0() {
    testCongestion(1, 0, false);
  }

  @Test
  public void testCongestion_2_0() {
    testCongestion(2, 0, false);
  }

  @Test
  public void testCongestion_3_0() {
    testCongestion(3, 0, false);
  }

  @Test
  public void testCongestion_1_1() {
    testCongestion(1, 1, true);
  }

  @Test
  public void testCongestion_2_1() {
    testCongestion(2, 1, false);
  }

  @Test
  public void testCongestion_3_1() {
    testCongestion(3, 1, false);
  }

  private void testCongestion(
    final int howManyParticipants,
    final int howManyReservations,
    final boolean expectedCongestion
  ) {
    final LocalDate now = LocalDate.now();

    final ExamEvent event = Factory.examEvent(ExamLanguage.FI);
    event.setDate(now.plusWeeks(5));
    event.setRegistrationCloses(now.plusWeeks(3));
    event.setMaxParticipants(2);

    entityManager.persist(event);

    for (int i = 0; i < howManyParticipants; i++) {
      createEnrollment(event, EnrollmentStatus.PAID);
    }
    createReservations(event, howManyReservations, LocalDateTime.now().plusMinutes(1));

    assertEquals(expectedCongestion, publicExamEventService.listExamEvents(ExamLevel.EXCELLENT).get(0).hasCongestion());
  }

  private void createReservations(final ExamEvent examEvent, final int howMany, final LocalDateTime expiresAt) {
    for (int i = 0; i < howMany; i++) {
      final Person p = Factory.person();
      final Reservation r = Factory.reservation(examEvent, p);
      r.setExpiresAt(expiresAt);
      entityManager.persist(p);
      entityManager.persist(r);
    }
  }

  private void createEnrollment(final ExamEvent examEvent, final EnrollmentStatus status) {
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setStatus(status);
    entityManager.persist(person);
    entityManager.persist(enrollment);
  }

  private void assertCorrectOrdering(
    final List<ExamEvent> expectedExamEventsOrdered,
    final List<PublicExamEventDTO> examEventDTOs
  ) {
    final List<Long> expectedOrdering = expectedExamEventsOrdered.stream().map(ExamEvent::getId).toList();
    final List<Long> actualOrdering = examEventDTOs.stream().map(PublicExamEventDTO::id).toList();

    assertEquals(expectedOrdering, actualOrdering);
  }

  private void assertExamEventDetails(final ExamEvent expected, final PublicExamEventDTO examEventDTO) {
    assertEquals(expected.getId(), examEventDTO.id());
    assertEquals(expected.getLanguage(), examEventDTO.language());
    assertEquals(expected.getDate(), examEventDTO.date());
    assertEquals(expected.getRegistrationCloses(), examEventDTO.registrationCloses());
  }

  @Test
  public void testExamEventHasNoOpeningsEvenIfOneEnrolledToQueue() {
    final LocalDate now = LocalDate.now();

    final ExamEvent event = Factory.examEvent(ExamLanguage.FI);
    event.setDate(now.plusWeeks(5));
    event.setRegistrationCloses(now.plusWeeks(3));
    event.setMaxParticipants(100);

    entityManager.persist(event);

    createEnrollment(event, EnrollmentStatus.PAID);
    createEnrollment(event, EnrollmentStatus.QUEUED);

    final PublicExamEventDTO publicExamEventDTO = publicExamEventService.listExamEvents(ExamLevel.EXCELLENT).get(0);
    assertEquals(0, publicExamEventDTO.openings());
  }
}
