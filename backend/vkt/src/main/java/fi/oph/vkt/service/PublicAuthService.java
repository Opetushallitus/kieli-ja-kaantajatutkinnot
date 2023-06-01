package fi.oph.vkt.service;

import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
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

  public String createCasLoginUrl(final long examEventId, final EnrollmentType type) {
    final String casLoginUrl = environment.getRequiredProperty("app.cas-oppija.login-url");
    final String casServiceUrl = URLEncoder.encode(
      String.format(environment.getRequiredProperty("app.cas-oppija.service-url"), examEventId, type),
      StandardCharsets.UTF_8
    );
    return casLoginUrl + "?service=" + casServiceUrl;
  }

  private Person createPerson(
    final String identityNumber,
    final String firstName,
    final String lastName,
    final String OID,
    final String otherIdentifier,
    final LocalDate dateOfBirth
  ) {
    final Person person = new Person();
    person.setIdentityNumber(identityNumber);
    person.setLastName(lastName);
    person.setFirstName(firstName);
    person.setOid(OID);
    person.setOtherIdentifier(otherIdentifier);
    person.setDateOfBirth(dateOfBirth);

    return personRepository.saveAndFlush(person);
  }

  public String getEnrollmentContactDetailsUrl(final long examEventId) {
    final String baseUrl = environment.getRequiredProperty("app.base-url.public");

    return String.format("%s/ilmoittaudu/%s/tiedot", baseUrl, examEventId);
  }

  public String getEnrollmentPreviewUrl(final long examEventId) {
    final String baseUrl = environment.getRequiredProperty("app.base-url.public");

    return String.format("%s/ilmoittaudu/%s/esikatsele", baseUrl, examEventId);
  }

  @Transactional
  public Person createPersonFromTicket(final String ticket, final long examEventId, final EnrollmentType type) {
    final Map<String, String> personDetails = casTicketValidationService.validate(ticket, examEventId, type);

    final String identityNumber = personDetails.get("identityNumber");
    final String firstName = personDetails.get("firstName");
    final String lastName = personDetails.get("lastName");
    final String OID = personDetails.get("oid");
    final String otherIdentifier = personDetails.get("otherIdentifier");
    final String dateOfBirthRaw = personDetails.get("dateOfBirth");
    final LocalDate dateOfBirth = dateOfBirthRaw == null || dateOfBirthRaw.isEmpty()
      ? null
      : LocalDate.parse(dateOfBirthRaw);

    final Optional<Person> optionalPerson = identityNumber != null && !identityNumber.isEmpty()
      ? personRepository.findByIdentityNumber(identityNumber)
      : personRepository.findByOtherIdentifier(otherIdentifier);

    return optionalPerson.orElseGet(() ->
      createPerson(identityNumber, firstName, lastName, OID, otherIdentifier, dateOfBirth)
    );
  }

  public String getErrorUrl() {
    final String baseUrl = environment.getRequiredProperty("app.base-url.public");

    return String.format("%s/etusivu?error=generic", baseUrl);
  }

  public String getErrorUrl(final APIExceptionType exceptionType) {
    final String baseUrl = environment.getRequiredProperty("app.base-url.public");

    return String.format("%s/etusivu?error=%s", baseUrl, exceptionType.getCode());
  }
}
