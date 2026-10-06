package fi.oph.yki.scheduled;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.RegistrationQueueService;
import fi.oph.yki.service.RegistrationQueueService.SessionLiftResult;
import fi.oph.yki.service.RegistrationQueueService.StopReason;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class RegistrationQueueHandlerTest {

  private RegistrationRepository registrationRepository;
  private RegistrationQueueService registrationQueueService;
  private RegistrationQueueHandler handler;

  @BeforeEach
  void setup() {
    registrationRepository = mock(RegistrationRepository.class);
    registrationQueueService = mock(RegistrationQueueService.class);
    handler = new RegistrationQueueHandler(registrationRepository, registrationQueueService);
  }

  @Test
  void testPassesEachSessionWhatIsLeftOfTheRunsBudget() {
    when(registrationRepository.findExamSessionIdsWithQueueToLift()).thenReturn(List.of(1L, 2L, 3L));
    when(registrationQueueService.liftFromQueue(1L, RegistrationQueueHandler.MAX_LIFTS_PER_RUN))
      .thenReturn(new SessionLiftResult(3, StopReason.NOTHING_TO_LIFT));
    when(registrationQueueService.liftFromQueue(2L, RegistrationQueueHandler.MAX_LIFTS_PER_RUN - 3))
      .thenReturn(new SessionLiftResult(0, StopReason.SESSION_LOCKED));
    when(registrationQueueService.liftFromQueue(3L, RegistrationQueueHandler.MAX_LIFTS_PER_RUN - 3))
      .thenReturn(new SessionLiftResult(2, StopReason.NOTHING_TO_LIFT));

    handler.action();

    verify(registrationQueueService).liftFromQueue(1L, RegistrationQueueHandler.MAX_LIFTS_PER_RUN);
    verify(registrationQueueService).liftFromQueue(2L, RegistrationQueueHandler.MAX_LIFTS_PER_RUN - 3);
    verify(registrationQueueService).liftFromQueue(3L, RegistrationQueueHandler.MAX_LIFTS_PER_RUN - 3);
  }

  @Test
  void testStopsIteratingSessionsOnceTheBudgetIsSpent() {
    when(registrationRepository.findExamSessionIdsWithQueueToLift()).thenReturn(List.of(1L, 2L));
    when(registrationQueueService.liftFromQueue(1L, RegistrationQueueHandler.MAX_LIFTS_PER_RUN))
      .thenReturn(new SessionLiftResult(RegistrationQueueHandler.MAX_LIFTS_PER_RUN, StopReason.LIFT_BUDGET_EXHAUSTED));

    handler.action();

    verify(registrationQueueService).liftFromQueue(1L, RegistrationQueueHandler.MAX_LIFTS_PER_RUN);
    verifyNoMoreInteractions(registrationQueueService);
  }

  @Test
  void testFailingSessionDoesNotStopTheRest() {
    when(registrationRepository.findExamSessionIdsWithQueueToLift()).thenReturn(List.of(1L, 2L));
    when(registrationQueueService.liftFromQueue(1L, RegistrationQueueHandler.MAX_LIFTS_PER_RUN))
      .thenThrow(new RuntimeException("session failed"));
    when(registrationQueueService.liftFromQueue(2L, RegistrationQueueHandler.MAX_LIFTS_PER_RUN))
      .thenReturn(new SessionLiftResult(1, StopReason.NOTHING_TO_LIFT));

    handler.action();

    verify(registrationQueueService).liftFromQueue(2L, RegistrationQueueHandler.MAX_LIFTS_PER_RUN);
  }

  @Test
  void testFailingCandidateQueryIsCaught() {
    when(registrationRepository.findExamSessionIdsWithQueueToLift()).thenThrow(new RuntimeException("db down"));

    handler.action();

    verifyNoMoreInteractions(registrationQueueService);
  }

  @Test
  void testHandlerExistsOnlyWhenEnabled() {
    final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
      .withBean(RegistrationRepository.class, () -> registrationRepository)
      .withBean(RegistrationQueueService.class, () -> registrationQueueService)
      .withUserConfiguration(RegistrationQueueHandler.class);

    contextRunner.run(context -> assertThat(context).doesNotHaveBean(RegistrationQueueHandler.class));
    contextRunner
      .withPropertyValues(RegistrationQueueHandler.ENABLED_PROPERTY + "=false")
      .run(context -> assertThat(context).doesNotHaveBean(RegistrationQueueHandler.class));
    contextRunner
      .withPropertyValues(RegistrationQueueHandler.ENABLED_PROPERTY + "=true")
      .run(context -> assertThat(context).hasSingleBean(RegistrationQueueHandler.class));
  }
}
