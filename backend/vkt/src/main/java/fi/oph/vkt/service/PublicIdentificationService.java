package fi.oph.vkt.service;

import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PersonRepository;
import java.util.List;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PublicIdentificationService {

  private final PersonRepository personRepository;

  // TODO: identify person with information received from suomi.fi identification service
  public Person identify() {
    final Random random = new Random();
    final List<String> identityNumbers = List.of(
      "200714-982U",
      "010934-984D",
      "210110-9320",
      "230182-980D",
      "130421-9046"
    );
    final String identityNumber = identityNumbers.get(random.nextInt(identityNumbers.size()));

    return personRepository.findByIdentityNumber(identityNumber).orElseGet(() -> createPerson(identityNumber));
  }

  private Person createPerson(final String identityNumber) {
    final Random random = new Random();
    final List<String> lastNames = List.of("Aaltonen", "Alanen", "Eskola", "Hakala", "Heikkinen");
    final List<String> firstNames = List.of("Anneli", "Ella", "Hanna", "Iiris", "Liisa");

    final Person person = new Person();
    person.setIdentityNumber(identityNumber);
    person.setLastName(lastNames.get(random.nextInt(lastNames.size())));
    person.setFirstName(firstNames.get(random.nextInt(firstNames.size())));
    // TODO: move contact details (email, phone number, address) under Enrollment?
    person.setEmail("email@test");
    person.setPhoneNumber("+3581234567");

    personRepository.saveAndFlush(person);
    return person;
  }
}
