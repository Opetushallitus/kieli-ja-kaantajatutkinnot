package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.repository.ExamEventRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class PublicExamEventServiceTest {

  @Resource
  private ExamEventRepository examEventRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicExamEventService publicExamEventService;

  @BeforeEach
  public void setup() {
    publicExamEventService = new PublicExamEventService(examEventRepository);
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
    hiddenEvent.setVisible(false);
    hiddenEvent.setDate(now.plusWeeks(1));

    final ExamEvent eventToday = Factory.examEvent(ExamLanguage.FI);
    eventToday.setDate(now);

    final ExamEvent upcomingEventSv = Factory.examEvent(ExamLanguage.SV);
    final ExamEvent upcomingEventFi = Factory.examEvent(ExamLanguage.FI);

    final ExamEvent futureEvent1 = Factory.examEvent(ExamLanguage.SV);
    futureEvent1.setDate(now.plusWeeks(4));
    futureEvent1.setRegistrationCloses(now.plusWeeks(3));

    final ExamEvent futureEvent2 = Factory.examEvent(ExamLanguage.FI);
    futureEvent2.setDate(now.plusWeeks(5));
    futureEvent2.setRegistrationCloses(now.plusWeeks(3));
    futureEvent2.setMaxParticipants(11);

    entityManager.persist(pastEvent);
    entityManager.persist(eventWithRegistrationClosed);
    entityManager.persist(hiddenEvent);
    entityManager.persist(eventToday);
    entityManager.persist(upcomingEventSv);
    entityManager.persist(upcomingEventFi);
    entityManager.persist(futureEvent1);
    entityManager.persist(futureEvent2);

    final List<PublicExamEventDTO> examEventDTOs = publicExamEventService.listExamEvents(ExamLevel.EXCELLENT);
    assertEquals(5, examEventDTOs.size());

    final List<ExamEvent> expectedExamEventsOrdered = List.of(
      eventToday,
      upcomingEventFi,
      upcomingEventSv,
      futureEvent1,
      futureEvent2
    );
    assertCorrectOrdering(expectedExamEventsOrdered, examEventDTOs);

    IntStream
      .range(0, expectedExamEventsOrdered.size())
      .forEach(i -> assertExamEventDetails(expectedExamEventsOrdered.get(i), examEventDTOs.get(i)));
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
    assertEquals(expected.getMaxParticipants(), examEventDTO.maxParticipants());
  }
}
