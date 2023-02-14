package fi.oph.vkt.service;

import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.util.List;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicAuthService {

  private final PersonRepository personRepository;

  private final CasTicketValidationService casTicketValidationService;

  // TODO: authenticate person with information received from suomi.fi authentication service
  @Transactional
  public Person authenticate() {
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

    personRepository.saveAndFlush(person);
    return person;
  }

  @Transactional
  public Person validate(final String ticket) {
    final Random random = new Random();
    final List<String> identityNumbers = List.of(
      "200714-982U",
      "010934-984D",
      "210110-9320",
      "230182-980D",
      "130421-9046"
    );

    final boolean isValid = casTicketValidationService.validate(ticket);

    if (!isValid) {
      throw new APIException(APIExceptionType.INVALID_TICKET);
    }

    final String identityNumber = identityNumbers.get(random.nextInt(identityNumbers.size()));

    return personRepository.findByIdentityNumber(identityNumber).orElseGet(() -> createPerson(identityNumber));
  }
}
