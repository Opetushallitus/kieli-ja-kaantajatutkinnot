package fi.oph.yki.scheduled;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.model.Person;
import fi.oph.yki.model.PersonSyncStatus;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.PersonSyncStatusRepository;
import fi.oph.yki.solki.SolkiService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClientResponseException;

class PersonsSyncScheduledTaskTest {

  private PersonSyncStatusRepository personSyncStatusRepository;
  private PersonRepository personRepository;
  private SolkiService solkiService;
  private PersonsSyncScheduledTask task;

  @BeforeEach
  void setup() {
    personSyncStatusRepository = Mockito.mock(PersonSyncStatusRepository.class);
    personRepository = Mockito.mock(PersonRepository.class);
    solkiService = Mockito.mock(SolkiService.class);
    task = new PersonsSyncScheduledTask(personSyncStatusRepository, personRepository, solkiService);
    ReflectionTestUtils.setField(task, "retryDurationInDays", 1);
  }

  private PersonSyncStatus syncStatus(final String personOid) {
    final PersonSyncStatus status = new PersonSyncStatus();
    status.setId(1L);
    status.setPersonOid(personOid);
    return status;
  }

  @Test
  void doesNothingWhenNoPendingSyncs() {
    Mockito.when(personSyncStatusRepository.findPendingSyncs(Mockito.any())).thenReturn(List.of());

    task.syncPersons();

    Mockito.verifyNoInteractions(personRepository, solkiService);
    Mockito.verify(personSyncStatusRepository, Mockito.never()).save(Mockito.any());
  }

  @Test
  void marksSuccessAndStopsRetryingOnSuccessfulSync() {
    final PersonSyncStatus status = syncStatus("1.2.3.4.5");
    final Person person = new Person();
    person.setOid("1.2.3.4.5");

    Mockito.when(personSyncStatusRepository.findPendingSyncs(Mockito.any())).thenReturn(List.of(status));
    Mockito.when(personRepository.getByOid("1.2.3.4.5")).thenReturn(person);

    task.syncPersons();

    Mockito.verify(solkiService).syncPerson(person);
    assertNotNull(status.getSuccessAt());
    assertNull(status.getFailedAt());
    assertFalse(status.getShouldRetry());
    Mockito.verify(personSyncStatusRepository).save(status);
  }

  @Test
  void marksFailureWithRetryOnGenericError() {
    final PersonSyncStatus status = syncStatus("1.2.3.4.5");
    final Person person = new Person();
    person.setOid("1.2.3.4.5");

    Mockito.when(personSyncStatusRepository.findPendingSyncs(Mockito.any())).thenReturn(List.of(status));
    Mockito.when(personRepository.getByOid("1.2.3.4.5")).thenReturn(person);
    Mockito.doThrow(new RuntimeException("connection refused")).when(solkiService).syncPerson(person);

    task.syncPersons();

    assertNull(status.getSuccessAt());
    assertNotNull(status.getFailedAt());
    assertTrue(status.getShouldRetry());
    Mockito.verify(personSyncStatusRepository).save(status);
  }

  @Test
  void doesNotRetryOn404FromSolki() {
    final PersonSyncStatus status = syncStatus("1.2.3.4.5");
    final Person person = new Person();
    person.setOid("1.2.3.4.5");

    Mockito.when(personSyncStatusRepository.findPendingSyncs(Mockito.any())).thenReturn(List.of(status));
    Mockito.when(personRepository.getByOid("1.2.3.4.5")).thenReturn(person);
    Mockito
      .doThrow(new RuntimeException("not found", new WebClientResponseException(404, "Not Found", null, null, null)))
      .when(solkiService)
      .syncPerson(person);

    task.syncPersons();

    assertNotNull(status.getFailedAt());
    assertFalse(status.getShouldRetry());
  }

  @Test
  void retriesWhenPersonNotFoundLocally() {
    final PersonSyncStatus status = syncStatus("1.2.3.4.5");

    Mockito.when(personSyncStatusRepository.findPendingSyncs(Mockito.any())).thenReturn(List.of(status));
    Mockito.when(personRepository.getByOid("1.2.3.4.5")).thenReturn(null);

    task.syncPersons();

    Mockito.verifyNoInteractions(solkiService);
    assertNotNull(status.getFailedAt());
    assertTrue(status.getShouldRetry());
  }

  @Test
  void passesRetryDeadlineDerivedFromConfiguredRetryDays() {
    Mockito.when(personSyncStatusRepository.findPendingSyncs(Mockito.any())).thenReturn(List.of());

    task.syncPersons();

    final ArgumentCaptor<LocalDateTime> captor = ArgumentCaptor.forClass(LocalDateTime.class);
    Mockito.verify(personSyncStatusRepository).findPendingSyncs(captor.capture());

    final LocalDateTime expectedAround = LocalDateTime.now().minusDays(1);
    assertTrue(java.time.Duration.between(captor.getValue(), expectedAround).abs().getSeconds() < 5);
  }

  @Test
  void continuesProcessingRemainingPersonsWhenOneFails() {
    final PersonSyncStatus first = syncStatus("1.2.3.4.5");
    final PersonSyncStatus second = syncStatus("1.2.3.4.6");
    final Person firstPerson = new Person();
    firstPerson.setOid("1.2.3.4.5");
    final Person secondPerson = new Person();
    secondPerson.setOid("1.2.3.4.6");

    Mockito.when(personSyncStatusRepository.findPendingSyncs(Mockito.any())).thenReturn(List.of(first, second));
    Mockito.when(personRepository.getByOid("1.2.3.4.5")).thenReturn(firstPerson);
    Mockito.when(personRepository.getByOid("1.2.3.4.6")).thenReturn(secondPerson);
    Mockito.doThrow(new RuntimeException("boom")).when(solkiService).syncPerson(firstPerson);

    task.syncPersons();

    assertNotNull(first.getFailedAt());
    assertNotNull(second.getSuccessAt());
    Mockito.verify(solkiService).syncPerson(secondPerson);
  }

  @Test
  void doesNotThrowWhenRepositoryQueryItselfFails() {
    Mockito.when(personSyncStatusRepository.findPendingSyncs(Mockito.any())).thenThrow(new RuntimeException("db down"));

    task.syncPersons();

    Mockito.verifyNoInteractions(personRepository, solkiService);
  }
}
