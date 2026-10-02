package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.RegistrationQueueLiftService.Outcome;
import fi.oph.yki.service.RegistrationQueueService.SessionLiftResult;
import fi.oph.yki.service.RegistrationQueueService.StopReason;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RegistrationQueueServiceTest {

  private static final long EXAM_SESSION_ID = 1L;

  private final RegistrationRepository registrationRepository = mock(RegistrationRepository.class);
  private final RegistrationQueueLiftService registrationQueueLiftService = mock(RegistrationQueueLiftService.class);

  private RegistrationQueueService registrationQueueService;

  @BeforeEach
  public void setup() {
    registrationQueueService = new RegistrationQueueService(registrationRepository, registrationQueueLiftService);
  }

  @Test
  public void testLiftsUntilNothingIsLeft() {
    when(registrationQueueLiftService.liftNext(anyLong()))
      .thenReturn(Outcome.LIFTED, Outcome.LIFTED, Outcome.NOTHING_TO_LIFT);

    assertEquals(
      new SessionLiftResult(2, StopReason.NOTHING_TO_LIFT),
      registrationQueueService.liftFromQueue(EXAM_SESSION_ID, 10)
    );
    verify(registrationQueueLiftService, times(3)).liftNext(EXAM_SESSION_ID);
  }

  @Test
  public void testStopsWhenTheLiftBudgetIsSpent() {
    when(registrationQueueLiftService.liftNext(anyLong())).thenReturn(Outcome.LIFTED);

    assertEquals(
      new SessionLiftResult(3, StopReason.LIFT_BUDGET_EXHAUSTED),
      registrationQueueService.liftFromQueue(EXAM_SESSION_ID, 3)
    );
    verify(registrationQueueLiftService, times(3)).liftNext(anyLong());
  }

  @Test
  public void testZeroBudgetLiftsNothing() {
    assertEquals(
      new SessionLiftResult(0, StopReason.LIFT_BUDGET_EXHAUSTED),
      registrationQueueService.liftFromQueue(EXAM_SESSION_ID, 0)
    );
    verify(registrationQueueLiftService, never()).liftNext(anyLong());
  }

  @Test
  public void testStopsWhenSessionIsLocked() {
    when(registrationQueueLiftService.liftNext(anyLong())).thenReturn(Outcome.LIFTED, Outcome.SESSION_LOCKED);

    assertEquals(
      new SessionLiftResult(1, StopReason.SESSION_LOCKED),
      registrationQueueService.liftFromQueue(EXAM_SESSION_ID, 10)
    );
    verify(registrationQueueLiftService, times(2)).liftNext(anyLong());
  }

  @Test
  public void testChecksForUnliftableRegistrations() {
    when(registrationQueueLiftService.liftNext(anyLong())).thenReturn(Outcome.NOTHING_TO_LIFT);

    registrationQueueService.liftFromQueue(EXAM_SESSION_ID, 10);

    verify(registrationRepository).countUnliftableQueuedRegistrations(EXAM_SESSION_ID);
  }
}
