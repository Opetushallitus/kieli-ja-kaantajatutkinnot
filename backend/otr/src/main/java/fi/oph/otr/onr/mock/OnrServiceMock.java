package fi.oph.otr.onr.mock;

import fi.oph.otr.onr.OnrService;
import fi.oph.otr.onr.model.Person;
import java.util.List;

public class OnrServiceMock implements OnrService {

  public List<Person> getPersons(final List<String> onrIds) {
    final PersonFactory personFactory = new PersonFactory();
    return onrIds.stream().map(personFactory::createPerson).toList();
  }
}
