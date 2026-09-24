package fi.oph.yki.scheduled;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.solki.SolkiService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

class ExamSessionSolkiSyncScheduledTaskTest {

  private ExamSessionRepository examSessionRepository;
  private SolkiService solkiService;
  private ExamSessionSolkiSyncScheduledTask task;

  @BeforeEach
  void setup() {
    examSessionRepository = Mockito.mock(ExamSessionRepository.class);
    solkiService = Mockito.mock(SolkiService.class);
    task = new ExamSessionSolkiSyncScheduledTask(examSessionRepository, solkiService);
  }

  private ExamSession examSession() {
    final ExamDate examDate = new ExamDate();
    examDate.setExamDate(LocalDate.of(2026, 6, 15));

    final Organizer organizer = new Organizer();
    organizer.setOid("1.2.3.4.5");

    final ExamSession examSession = new ExamSession();
    examSession.setId(1L);
    examSession.setExamDate(examDate);
    examSession.setOrganizer(organizer);
    examSession.setLanguage("fin");
    examSession.setLevel("PERUS");

    return examSession;
  }

  @Test
  void doesNothingWhenNoUnsyncedSessions() {
    Mockito.when(examSessionRepository.findUnsyncedExamSessions(Mockito.any())).thenReturn(List.of());

    task.syncExamSessions();

    Mockito.verifyNoInteractions(solkiService);
    Mockito.verify(examSessionRepository, Mockito.never()).save(Mockito.any());
  }

  @Test
  void syncsOrganizerThenExamSessionAndStampsLastSyncAtOnSuccess() {
    final ExamSession examSession = examSession();
    Mockito.when(examSessionRepository.findUnsyncedExamSessions(Mockito.any())).thenReturn(List.of(examSession));

    task.syncExamSessions();

    final var order = Mockito.inOrder(solkiService);
    order.verify(solkiService).syncOrganizer(examSession.getOrganizer(), examSession.getOfficeOid());
    order.verify(solkiService).syncExamSession(examSession);

    assertNotNull(examSession.getLastSyncAt());
    Mockito.verify(examSessionRepository).save(examSession);
  }

  @Test
  void leavesLastSyncAtNullAndContinuesWhenOneSessionFails() {
    final ExamSession failing = examSession();
    failing.setId(1L);
    final ExamSession succeeding = examSession();
    succeeding.setId(2L);

    Mockito
      .when(examSessionRepository.findUnsyncedExamSessions(Mockito.any()))
      .thenReturn(List.of(failing, succeeding));
    Mockito
      .doThrow(new RuntimeException("SOLKI down"))
      .when(solkiService)
      .syncOrganizer(failing.getOrganizer(), failing.getOfficeOid());

    task.syncExamSessions();

    assertNull(failing.getLastSyncAt());
    assertNotNull(succeeding.getLastSyncAt());
    Mockito.verify(examSessionRepository, Mockito.never()).save(failing);
    Mockito.verify(examSessionRepository).save(succeeding);
    Mockito.verify(solkiService).syncExamSession(succeeding);
  }

  @Test
  void passesTodayAsTheDateFilter() {
    Mockito.when(examSessionRepository.findUnsyncedExamSessions(Mockito.any())).thenReturn(List.of());

    task.syncExamSessions();

    final ArgumentCaptor<LocalDate> captor = ArgumentCaptor.forClass(LocalDate.class);
    Mockito.verify(examSessionRepository).findUnsyncedExamSessions(captor.capture());
    org.junit.jupiter.api.Assertions.assertEquals(LocalDate.now(), captor.getValue());
  }

  @Test
  void doesNotThrowWhenRepositoryQueryItselfFails() {
    Mockito
      .when(examSessionRepository.findUnsyncedExamSessions(Mockito.any()))
      .thenThrow(new RuntimeException("db down"));

    task.syncExamSessions();

    Mockito.verifyNoInteractions(solkiService);
  }
}
