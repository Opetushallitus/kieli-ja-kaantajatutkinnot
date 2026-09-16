package fi.oph.yki.scheduled;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.ParticipantSyncStatus;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.ParticipantSyncStatusRepository;
import fi.oph.yki.solki.SolkiService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

class ParticipantsSyncScheduledTaskTest {

  private ExamSessionRepository examSessionRepository;
  private ParticipantSyncStatusRepository participantSyncStatusRepository;
  private SolkiService solkiService;
  private ParticipantsSyncScheduledTask task;

  @BeforeEach
  void setup() {
    examSessionRepository = Mockito.mock(ExamSessionRepository.class);
    participantSyncStatusRepository = Mockito.mock(ParticipantSyncStatusRepository.class);
    solkiService = Mockito.mock(SolkiService.class);
    task = new ParticipantsSyncScheduledTask(examSessionRepository, participantSyncStatusRepository, solkiService);
    ReflectionTestUtils.setField(task, "retryDurationInDays", 1);
  }

  private ExamSession examSession(final long id) {
    final ExamDate examDate = new ExamDate();
    examDate.setExamDate(LocalDate.of(2026, 6, 15));

    final Organizer organizer = new Organizer();
    organizer.setOid("1.2.3.4.5");

    final ExamSession examSession = new ExamSession();
    examSession.setId(id);
    examSession.setExamDate(examDate);
    examSession.setOrganizer(organizer);
    examSession.setLanguage("fin");
    examSession.setLevel("PERUS");

    return examSession;
  }

  @Test
  void doesNothingWhenNoSessionsDue() {
    Mockito.when(examSessionRepository.findExamSessionsDueForParticipantSync(Mockito.anyInt())).thenReturn(List.of());

    task.syncParticipants();

    Mockito.verifyNoInteractions(solkiService, participantSyncStatusRepository);
  }

  @Test
  void insertsStatusRowAndMarksSuccessOnSuccessfulSync() {
    final ExamSession examSession = examSession(1L);
    Mockito.when(examSessionRepository.findExamSessionsDueForParticipantSync(1)).thenReturn(List.of(examSession));

    task.syncParticipants();

    final ArgumentCaptor<ParticipantSyncStatus> captor = ArgumentCaptor.forClass(ParticipantSyncStatus.class);
    Mockito.verify(participantSyncStatusRepository).save(captor.capture());
    assertEquals(examSession, captor.getValue().getExamSession());

    Mockito.verify(solkiService).syncExamSessionParticipants(examSession);
    Mockito.verify(participantSyncStatusRepository).markSuccess(examSession);
    Mockito.verify(participantSyncStatusRepository, Mockito.never()).markFailed(Mockito.any());
  }

  @Test
  void insertsStatusRowAndMarksFailedOnExceptionButContinuesWithRemaining() {
    final ExamSession failing = examSession(1L);
    final ExamSession succeeding = examSession(2L);
    Mockito
      .when(examSessionRepository.findExamSessionsDueForParticipantSync(1))
      .thenReturn(List.of(failing, succeeding));
    Mockito.doThrow(new RuntimeException("SOLKI down")).when(solkiService).syncExamSessionParticipants(failing);

    task.syncParticipants();

    Mockito.verify(participantSyncStatusRepository).markFailed(failing);
    Mockito.verify(participantSyncStatusRepository, Mockito.never()).markSuccess(failing);
    Mockito.verify(participantSyncStatusRepository).markSuccess(succeeding);
    Mockito.verify(solkiService).syncExamSessionParticipants(succeeding);
  }

  @Test
  void passesConfiguredRetryDaysToQuery() {
    ReflectionTestUtils.setField(task, "retryDurationInDays", 5);
    Mockito.when(examSessionRepository.findExamSessionsDueForParticipantSync(Mockito.anyInt())).thenReturn(List.of());

    task.syncParticipants();

    Mockito.verify(examSessionRepository).findExamSessionsDueForParticipantSync(5);
  }

  @Test
  void doesNotThrowWhenRepositoryQueryItselfFails() {
    Mockito
      .when(examSessionRepository.findExamSessionsDueForParticipantSync(Mockito.anyInt()))
      .thenThrow(new RuntimeException("db down"));

    task.syncParticipants();

    Mockito.verifyNoInteractions(solkiService, participantSyncStatusRepository);
  }
}
