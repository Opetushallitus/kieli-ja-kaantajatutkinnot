package fi.oph.vkt.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.service.auth.ticketValidator.CasAttributes;
import fi.oph.vkt.service.auth.ticketValidator.CasResponse;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
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

    personRepository.saveAndFlush(person);
    return person;
  }

  @Transactional
  public PublicPersonDTO validate(final String ticket) throws JsonProcessingException {
    final CasResponse casResponse = casTicketValidationService.validate(ticket);

    if (casResponse.getAuthenticationSuccess().getUser().isEmpty()) {
      throw new APIException(APIExceptionType.INVALID_TICKET);
    }

    final CasAttributes casAttributes = casResponse.getAuthenticationSuccess().getAttributes();
    final String identityNumber = casAttributes.getNationalIdentificationNumber();
    final String firstName = casAttributes.getFirstName();
    final String lastName = casAttributes.getSn();

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
