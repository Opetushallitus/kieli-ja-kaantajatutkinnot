package fi.oph.otr.onr;

import fi.oph.otr.onr.model.Person;
import java.util.List;

public interface OnrService {
  List<Person> getPersons(final List<String> onrIds);
}
