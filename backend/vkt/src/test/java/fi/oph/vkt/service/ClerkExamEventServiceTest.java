package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.exam.ExamLanguage;
import fi.oph.vkt.repository.ExamEventRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class ClerkExamEventServiceTest {

  @Resource
  private ExamEventRepository examEventRepository;

  @MockBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  private ClerkExamEventService clerkExamEventService;

  @BeforeEach
  public void setup() {
    clerkExamEventService = new ClerkExamEventService(examEventRepository, auditService);
  }

  @Test
  public void testListExamEvents() {
    final LocalDate now = LocalDate.now();

    final ExamEvent pastEvent = Factory.examEvent();
    pastEvent.setDate(now.minusWeeks(3));
    pastEvent.setRegistrationCloses(now.minusWeeks(4));

    final ExamEvent eventToday = Factory.examEvent(ExamLanguage.FI);
    eventToday.setDate(now);

    final ExamEvent eventWithRegistrationClosed = Factory.examEvent();
    eventWithRegistrationClosed.setDate(now.plusDays(3));
    eventWithRegistrationClosed.setRegistrationCloses(now.minusDays(1));

    final ExamEvent hiddenEvent = Factory.examEvent();
    hiddenEvent.setVisible(false);
    hiddenEvent.setDate(now.plusWeeks(1));

    final ExamEvent upcomingEventSv = Factory.examEvent(ExamLanguage.SV);
    final ExamEvent upcomingEventFi = Factory.examEvent(ExamLanguage.FI);

    final ExamEvent futureEvent = Factory.examEvent(ExamLanguage.FI);
    futureEvent.setDate(now.plusWeeks(3));
    futureEvent.setRegistrationCloses(now.plusWeeks(2));

    entityManager.persist(pastEvent);
    entityManager.persist(eventToday);
    entityManager.persist(eventWithRegistrationClosed);
    entityManager.persist(hiddenEvent);
    entityManager.persist(upcomingEventSv);
    entityManager.persist(upcomingEventFi);
    entityManager.persist(futureEvent);

    final List<ClerkExamEventListDTO> examEventListDTOs = clerkExamEventService.list();
    assertEquals(7, examEventListDTOs.size());

    final List<ExamEvent> expectedExamEventsOrdered = List.of(
      pastEvent,
      eventToday,
      eventWithRegistrationClosed,
      hiddenEvent,
      upcomingEventFi,
      upcomingEventSv,
      futureEvent
    );
    assertCorrectOrdering(expectedExamEventsOrdered, examEventListDTOs);

    IntStream
      .range(0, expectedExamEventsOrdered.size())
      .forEach(i -> {
        assertExamEventListDTODetails(expectedExamEventsOrdered.get(i), examEventListDTOs.get(i));

        final boolean expectedIsPublic = i == 1 || i >= 4;
        assertEquals(expectedIsPublic, examEventListDTOs.get(i).isPublic());
      });

    verify(auditService).logOperation(VktOperation.LIST_EXAM_EVENTS);
    verifyNoMoreInteractions(auditService);
  }

  private void assertCorrectOrdering(
    final List<ExamEvent> expectedExamEventsOrdered,
    final List<ClerkExamEventListDTO> examEventsListDTOs
  ) {
    final List<Long> expectedOrdering = expectedExamEventsOrdered.stream().map(ExamEvent::getId).toList();
    final List<Long> actualOrdering = examEventsListDTOs.stream().map(ClerkExamEventListDTO::id).toList();

    assertEquals(expectedOrdering, actualOrdering);
  }

  private void assertExamEventListDTODetails(final ExamEvent expected, final ClerkExamEventListDTO examEventListDTO) {
    assertEquals(expected.getId(), examEventListDTO.id());
    assertEquals(expected.getLanguage(), examEventListDTO.language());
    assertEquals(expected.getLevel(), examEventListDTO.level());
    assertEquals(expected.getDate(), examEventListDTO.date());
    assertEquals(expected.getRegistrationCloses(), examEventListDTO.registrationCloses());
    assertEquals(expected.getMaxParticipants(), examEventListDTO.maxParticipants());
  }
}
