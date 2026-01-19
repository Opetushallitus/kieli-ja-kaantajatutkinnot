package fi.oph.yki;

import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.model.type.FreeRegistrationType;

public class Factory {

  public static Person person() {
    final Person person = new Person();
    person.setOid("1.2.3.4.5");

    return person;
  }

  public static Registration registration(final Person person) {
    final Registration registration = new Registration();
    registration.setPerson(person);

    return registration;
  }

  public static FreeRegistration freeRegistration(final Registration registration) {
    final FreeRegistration freeRegistration = new FreeRegistration();
    freeRegistration.setRegistration(registration);
    freeRegistration.setType(FreeRegistrationType.MatriculationExam);
    freeRegistration.setSource(FreeRegistrationSource.KOSKI);
    freeRegistration.setIsForeignEducation(false);
    freeRegistration.setEb(false);
    freeRegistration.setDia(false);
    freeRegistration.setMatriculationExam(true);
    freeRegistration.setOther(false);
    freeRegistration.setHigherEducationConcluded(false);
    freeRegistration.setHigherEducationEnrolled(false);

    return freeRegistration;
  }
}
