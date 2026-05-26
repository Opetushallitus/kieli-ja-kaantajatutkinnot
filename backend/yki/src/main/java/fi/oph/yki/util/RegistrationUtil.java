package fi.oph.yki.util;

import fi.oph.yki.api.dto.clerk.ClerkExamSessionLocationDTO;
import fi.oph.yki.api.dto.clerk.ClerkPersonDTO;
import fi.oph.yki.api.dto.clerk.ClerkRegistrationDTO;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
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

  public static ClerkExamSessionLocationDTO createClerkExamSessionLocationDTO(final ExamSessionLocation location) {
    return ClerkExamSessionLocationDTO
      .builder()
      .postOffice(location.getPostOffice())
      .name(location.getName())
      .lang(location.getLang())
      .streetAddress(location.getStreetAddress())
      .extraInformation(location.getExtraInformation())
      .otherLocationInfo(location.getOtherLocationInfo())
      .zip(location.getZip())
      .build();
  }

  public static ClerkPersonDTO createClerkPersonDTO(final Person person) {
    return ClerkPersonDTO
      .builder()
      .oid(person.getOid())
      .firstName(person.getFirstName())
      .lastName(person.getLastName())
      .build();
  }

  public static ClerkRegistrationDTO createClerkRegistrationDTO(final Registration registration) {
    final Person person = registration.getPerson();

    return ClerkRegistrationDTO
      .builder()
      .id(registration.getId())
      .state(registration.getState())
      .kind(registration.getKind())
      .partialExamType(registration.getPartialExamType())
      .registrationDate(registration.getCreatedAt().toLocalDate())
      .person(person != null ? createClerkPersonDTO(person) : null)
      .build();
  }
}
