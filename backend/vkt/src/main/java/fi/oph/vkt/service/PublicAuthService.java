package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicAuthService {

  private final PersonRepository personRepository;

  private final CasTicketValidationService casTicketValidationService;

  private final Environment environment;

  public String createCasLoginUrl() {
    final String casLoginUrl = environment.getRequiredProperty("app.cas-oppija.login-url");
    final String casServiceUrl = URLEncoder.encode(
      environment.getRequiredProperty("app.cas-oppija.service-url"),
      StandardCharsets.UTF_8
    );
    return casLoginUrl + "?service=" + casServiceUrl;
  }

  private Person createPerson(final String identityNumber, final String firstName, final String lastName) {
    final Person person = new Person();
    person.setIdentityNumber(identityNumber);
    person.setLastName(lastName);
    person.setFirstName(firstName);

    return personRepository.saveAndFlush(person);
  }

  @Transactional
  public PublicPersonDTO createPersonFromTicket(final String ticket) {
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
