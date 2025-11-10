package fi.oph.yki;

import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;

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
}
