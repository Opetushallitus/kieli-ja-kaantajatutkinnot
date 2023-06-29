package fi.oph.vkt.service;

import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicAuthService {

  private final CasTicketValidationService casTicketValidationService;
  private final PersonRepository personRepository;
  private final Environment environment;

  public String createCasLoginUrl(final long examEventId, final EnrollmentType type) {
    final String casLoginUrl = environment.getRequiredProperty("app.cas-oppija.login-url");
    final String casServiceUrl = URLEncoder.encode(
      String.format(environment.getRequiredProperty("app.cas-oppija.service-url"), examEventId, type),
      StandardCharsets.UTF_8
    );
    return casLoginUrl + "?service=" + casServiceUrl;
  }

  @Transactional
  public Person createPersonFromTicket(final String ticket, final long examEventId, final EnrollmentType type) {
    final Map<String, String> personDetails = casTicketValidationService.validate(ticket, examEventId, type);

    final String lastName = personDetails.get("lastName");
    final String firstName = personDetails.get("firstName");
    final String oid = personDetails.get("oid");
    final String otherIdentifier = personDetails.get("otherIdentifier");

    final Optional<Person> optionalPerson = oid != null && !oid.isEmpty()
      ? personRepository.findByOid(oid)
      : personRepository.findByOtherIdentifier(otherIdentifier);

    final Person person = optionalPerson.orElse(new Person());
    person.setLastName(lastName);
    person.setFirstName(firstName);
    person.setOid(oid);
    person.setOtherIdentifier(otherIdentifier);
    person.setLatestIdentifiedAt(LocalDateTime.now());

    return personRepository.saveAndFlush(person);
  }
}
