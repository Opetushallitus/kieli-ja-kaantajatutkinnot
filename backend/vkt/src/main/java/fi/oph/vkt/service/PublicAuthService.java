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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicAuthService {

  private final PersonRepository personRepository;

  private final CasTicketValidationService casTicketValidationService;

  private Person createPerson(final String identityNumber, final String firstName, final String lastName) {
    final Person person = new Person();
    person.setIdentityNumber(identityNumber);
    person.setLastName(lastName);
    person.setFirstName(firstName);

    return personRepository.saveAndFlush(person);
  }

  @Transactional
  public PublicPersonDTO validate(final String ticket) {
    final Map<String, String> personDetails = casTicketValidationService.validate(ticket);

    final String identityNumber = personDetails.get("identityNumber");
    final String firstName = personDetails.get("firstName");
    final String lastName = personDetails.get("lastName");

    final Person person = personRepository
      .findByIdentityNumber(identityNumber)
      .orElseGet(() -> createPerson(identityNumber, firstName, lastName));

    return PublicPersonDTO
      .builder()
      .id(person.getId())
      .firstName(person.getFirstName())
      .lastName(person.getLastName())
      .identityNumber(person.getIdentityNumber())
      .build();
  }
}
