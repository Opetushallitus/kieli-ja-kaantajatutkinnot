package fi.oph.vkt.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.service.auth.ticketValidator.CasResponse;
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

  private Person createPerson(final String identityNumber, final String firstNames, final String lastNames) {
    final Person person = new Person();
    person.setIdentityNumber(identityNumber);
    person.setLastName(lastNames);
    person.setFirstName(firstNames);

    personRepository.saveAndFlush(person);
    return person;
  }

  @Transactional
  public Person validate(final String ticket) throws JsonProcessingException {
    final CasResponse casResponse = casTicketValidationService.validate(ticket);

    if (casResponse.getAuthenticationSuccess().getUser().isEmpty()) {
      throw new APIException(APIExceptionType.INVALID_TICKET);
    }

    final String identityNumber = casResponse
      .getAuthenticationSuccess()
      .getAttributes()
      .getNationalIdentificationNumber();
    final String firstNames = casResponse.getAuthenticationSuccess().getAttributes().getFirstName();
    final String lastName = casResponse.getAuthenticationSuccess().getAttributes().getSn();

    return personRepository
      .findByIdentityNumber(identityNumber)
      .orElseGet(() -> createPerson(identityNumber, firstNames, lastName));
  }
}
