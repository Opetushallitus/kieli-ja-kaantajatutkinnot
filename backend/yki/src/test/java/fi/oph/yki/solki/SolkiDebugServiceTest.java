package fi.oph.yki.solki;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ParticipantSyncStatus;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.ParticipantSyncStatusRepository;
import fi.oph.yki.util.exception.NotFoundException;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

class SolkiDebugServiceTest {

  private ExamSessionRepository examSessionRepository;
  private ParticipantSyncStatusRepository participantSyncStatusRepository;
  private SolkiService solkiService;
  private SolkiDebugService solkiDebugService;

  @BeforeEach
  void setup() {
    examSessionRepository = Mockito.mock(ExamSessionRepository.class);
    participantSyncStatusRepository = Mockito.mock(ParticipantSyncStatusRepository.class);
    solkiService = Mockito.mock(SolkiService.class);
    solkiDebugService = new SolkiDebugService(examSessionRepository, participantSyncStatusRepository, solkiService);
  }

  private ExamSession examSession(final long id) {
    final ExamSession examSession = new ExamSession();
    examSession.setId(id);
    return examSession;
  }

  @Test
  void checkConnectionDelegatesToSolkiService() {
    Mockito.when(solkiService.checkConnection()).thenReturn(200);

    assertEquals(200, solkiDebugService.checkConnection());
  }

  @Test
  void exportParticipantsCsvFetchesExamSessionAndBuildsCsv() {
    final ExamSession examSession = examSession(1L);
    Mockito
      .when(examSessionRepository.findByIdInWithOrganizerAndExamDate(List.of(1L)))
      .thenReturn(List.of(examSession));
    Mockito.when(solkiService.buildParticipantsCsv(examSession)).thenReturn("csv-content");

    assertEquals("csv-content", solkiDebugService.exportParticipantsCsv(1L));
  }

  @Test
  void exportParticipantsCsvThrowsNotFoundWhenExamSessionMissing() {
    Mockito.when(examSessionRepository.findByIdInWithOrganizerAndExamDate(List.of(1L))).thenReturn(List.of());

    assertThrows(NotFoundException.class, () -> solkiDebugService.exportParticipantsCsv(1L));
  }

  @Test
  void forceSyncExamSessionDelegatesToSolkiService() {
    final ExamSession examSession = examSession(1L);
    Mockito
      .when(examSessionRepository.findByIdInWithOrganizerAndExamDate(List.of(1L)))
      .thenReturn(List.of(examSession));

    solkiDebugService.forceSyncExamSession(1L);

    Mockito.verify(solkiService).forceSyncExamSessionAndOrganizer(examSession);
  }

  @Test
  void forceSyncExamSessionThrowsNotFoundWhenExamSessionMissing() {
    Mockito.when(examSessionRepository.findByIdInWithOrganizerAndExamDate(List.of(1L))).thenReturn(List.of());

    assertThrows(NotFoundException.class, () -> solkiDebugService.forceSyncExamSession(1L));
    Mockito.verifyNoInteractions(solkiService);
  }

  @Test
  void forceSyncParticipantsInsertsStatusRowAndMarksSuccess() {
    final ExamSession examSession = examSession(1L);
    Mockito
      .when(examSessionRepository.findByIdInWithOrganizerAndExamDate(List.of(1L)))
      .thenReturn(List.of(examSession));

    solkiDebugService.forceSyncParticipants(1L);

    final ArgumentCaptor<ParticipantSyncStatus> captor = ArgumentCaptor.forClass(ParticipantSyncStatus.class);
    Mockito.verify(participantSyncStatusRepository).save(captor.capture());
    assertEquals(examSession, captor.getValue().getExamSession());
    assertNotNull(captor.getValue());

    Mockito.verify(solkiService).forceSyncExamSessionParticipants(examSession);
    Mockito.verify(participantSyncStatusRepository).markSuccess(examSession);
    Mockito.verify(participantSyncStatusRepository, Mockito.never()).markFailed(Mockito.any());
  }

  @Test
  void forceSyncParticipantsMarksFailedAndRethrowsOnError() {
    final ExamSession examSession = examSession(1L);
    Mockito
      .when(examSessionRepository.findByIdInWithOrganizerAndExamDate(List.of(1L)))
      .thenReturn(List.of(examSession));
    Mockito
      .doThrow(new RuntimeException("SOLKI down"))
      .when(solkiService)
      .forceSyncExamSessionParticipants(examSession);

    assertThrows(RuntimeException.class, () -> solkiDebugService.forceSyncParticipants(1L));

    Mockito.verify(participantSyncStatusRepository).markFailed(examSession);
    Mockito.verify(participantSyncStatusRepository, Mockito.never()).markSuccess(Mockito.any());
  }
}
