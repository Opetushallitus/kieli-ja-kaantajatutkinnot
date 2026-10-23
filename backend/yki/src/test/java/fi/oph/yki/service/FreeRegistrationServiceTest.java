package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.model.type.RegistrationState;
import org.junit.jupiter.api.Test;

public class FreeRegistrationServiceTest {

  private static Registration registration(final String level, final String language, final RegistrationState state) {
    final ExamSession examSession = Factory.examSession(Factory.examDate());
    examSession.setLevel(level);
    examSession.setLanguage(language);
    final Registration registration = Factory.registration(Factory.person());
    registration.setExamSession(examSession);
    registration.setState(state);

    return registration;
  }

  @Test
  public void testEducationSourcesAllowedOnlyForAdvancedLevel() {
    for (final FreeRegistrationSource source : new FreeRegistrationSource[] {
      FreeRegistrationSource.KOSKI,
      FreeRegistrationSource.USER,
    }) {
      assertTrue(
        FreeRegistrationService.isFreeRegistrationAllowed(
          registration("YLIN", "fin", RegistrationState.STARTED),
          source
        )
      );
      assertTrue(
        FreeRegistrationService.isFreeRegistrationAllowed(
          registration("YLIN", "swe", RegistrationState.STARTED),
          source
        )
      );
      assertFalse(
        FreeRegistrationService.isFreeRegistrationAllowed(
          registration("KESKI", "fin", RegistrationState.STARTED),
          source
        )
      );
      assertFalse(
        FreeRegistrationService.isFreeRegistrationAllowed(
          registration("PERUS", "fin", RegistrationState.STARTED),
          source
        )
      );
    }
  }

  @Test
  public void testIntegrationAssistanceAllowedOnlyForIntermediateLevel() {
    final FreeRegistrationSource source = FreeRegistrationSource.KEHA;

    assertTrue(
      FreeRegistrationService.isFreeRegistrationAllowed(registration("KESKI", "fin", RegistrationState.STARTED), source)
    );
    assertTrue(
      FreeRegistrationService.isFreeRegistrationAllowed(registration("KESKI", "swe", RegistrationState.STARTED), source)
    );
    assertFalse(
      FreeRegistrationService.isFreeRegistrationAllowed(registration("YLIN", "fin", RegistrationState.STARTED), source)
    );
    assertFalse(
      FreeRegistrationService.isFreeRegistrationAllowed(registration("PERUS", "fin", RegistrationState.STARTED), source)
    );
  }

  @Test
  public void testOnlyFinnishAndSwedishAllowed() {
    for (final FreeRegistrationSource source : FreeRegistrationSource.values()) {
      final String level = source == FreeRegistrationSource.KEHA ? "KESKI" : "YLIN";
      assertFalse(
        FreeRegistrationService.isFreeRegistrationAllowed(registration(level, "eng", RegistrationState.STARTED), source)
      );
      assertFalse(
        FreeRegistrationService.isFreeRegistrationAllowed(registration(level, "deu", RegistrationState.STARTED), source)
      );
    }
  }

  @Test
  public void testOnlyStartedRegistrationAllowed() {
    for (final RegistrationState state : RegistrationState.values()) {
      if (state == RegistrationState.STARTED) {
        continue;
      }
      assertFalse(
        FreeRegistrationService.isFreeRegistrationAllowed(
          registration("KESKI", "fin", state),
          FreeRegistrationSource.KEHA
        )
      );
    }
  }
}
