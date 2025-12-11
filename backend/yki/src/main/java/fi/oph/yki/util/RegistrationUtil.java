package fi.oph.yki.util;

import fi.oph.yki.api.dto.clerk.ClerkRegistrationDTO;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Registration;
import fi.oph.yki.service.dto.FreeRegistrationDTO;

public class RegistrationUtil {

  public static FreeRegistrationDTO createFreeRegistrationDTO(final FreeRegistration freeRegistration) {
    return FreeRegistrationDTO
      .builder()
      .registrationId(freeRegistration.getRegistration().getId())
      .source(freeRegistration.getSource().toString())
      .type(freeRegistration.getType().toString())
      .matriculationExam(freeRegistration.getMatriculationExam())
      .higherEducationEnrolled(freeRegistration.getHigherEducationEnrolled())
      .higherEducationConcluded(freeRegistration.getHigherEducationConcluded())
      .eb(freeRegistration.getEb())
      .dia(freeRegistration.getDia())
      .other(freeRegistration.getOther())
      .build();
  }

  public static ClerkRegistrationDTO createClerkRegistrationDTO(final Registration registration) {
    return ClerkRegistrationDTO.builder().build();
  }
}
