package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.service.auth.ticketValidator.CasAttributes;
import fi.oph.vkt.service.auth.ticketValidator.CasResponse;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicAuthService {

  private final PersonRepository personRepository;

  private final CasTicketValidationService casTicketValidationService;

  private Person createPerson(
    final String identityNumber,
    final String firstName,
    final String lastName,
    final String OID,
    final String otherIdentifier
  ) {
    final Person person = new Person();
    person.setIdentityNumber(identityNumber);
    person.setLastName(lastName);
    person.setFirstName(firstName);
    person.setOid(OID);
    person.setOtherIdentifier(otherIdentifier);

    return personRepository.saveAndFlush(person);
  }

  @Transactional
  public PublicPersonDTO validate(final String ticket) {
    final Map<String, String> personDetails = casTicketValidationService.validate(ticket);

    final String identityNumber = personDetails.get("identityNumber");
    final String otherIdentifier = personDetails.get("otherIdentifier");
    final String firstName = personDetails.get("firstName");
    final String lastName = personDetails.get("lastName");
    final String OID = personDetails.get("oid");

    final Optional<Person> maybePerson = identityNumber != null && !identityNumber.isEmpty()
      ? personRepository.findByIdentityNumber(identityNumber)
      : personRepository.findByOtherIdentifier(otherIdentifier);
    final Person person = maybePerson.orElseGet(() ->
      createPerson(identityNumber, firstName, lastName, OID, otherIdentifier)
    );

    return PublicPersonDTO
      .builder()
      .id(person.getId())
      .firstName(person.getFirstName())
      .lastName(person.getLastName())
      .identityNumber(person.getIdentityNumber())
      .build();
  }
}
