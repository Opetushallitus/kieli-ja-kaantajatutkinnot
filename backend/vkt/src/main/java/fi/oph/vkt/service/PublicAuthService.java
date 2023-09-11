package fi.oph.vkt.service;

import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.AppLocale;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.util.StringUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PublicAuthService {

  private static final Logger LOG = LoggerFactory.getLogger(PublicAuthService.class);

  private final CasTicketValidationService casTicketValidationService;
  private final PersonRepository personRepository;
  private final Environment environment;
  private final String salt;

  public PublicAuthService(
    final CasTicketValidationService casTicketValidationService,
    final PersonRepository personRepository,
    final Environment environment,
    @Value("${app.salt:null}") final String salt
  ) {
    this.casTicketValidationService = casTicketValidationService;
    this.personRepository = personRepository;
    this.environment = environment;
    this.salt = salt;
  }

  public String createCasLoginUrl(final long examEventId, final EnrollmentType type, final AppLocale appLocale) {
    final String casLoginUrl = environment.getRequiredProperty("app.cas-oppija.login-url");
    final String casServiceUrl = URLEncoder.encode(
      String.format(environment.getRequiredProperty("app.cas-oppija.service-url"), examEventId, type),
      StandardCharsets.UTF_8
    );
    return casLoginUrl + "?service=" + casServiceUrl + "&locale=" + appLocale.name().toLowerCase();
  }

  @Transactional
  public Person createPersonFromTicket(final String ticket, final long examEventId, final EnrollmentType type) {
    final Map<String, String> personDetails = casTicketValidationService.validate(ticket, examEventId, type);

    final String lastName = personDetails.get("lastName");
    final String firstName = personDetails.get("firstName");
    final String oid = personDetails.get("oid");
    String otherIdentifier = personDetails.get("otherIdentifier");
    final String nationalIdentificationNumber = personDetails.get("nationalIdentificationNumber");

    if ((oid == null || oid.isEmpty()) && (otherIdentifier == null || otherIdentifier.isEmpty())) {
      if (nationalIdentificationNumber == null || nationalIdentificationNumber.isEmpty()) {
        LOG.error(
          "Person OID, otherIdentifier and nationalIdentificationNumber are empty. Person details: {}",
          personDetails
        );
        throw new APIException(APIExceptionType.TICKET_VALIDATION_ERROR);
      } else {
        otherIdentifier = nationalIdentificationNumber;
      }
    }

    final String hashedOtherIdentifier = StringUtil.getHash(otherIdentifier, salt);
    final Optional<Person> optionalExistingPerson = oid != null && !oid.isEmpty()
      ? personRepository.findByOid(oid)
      : personRepository
        .findByOtherIdentifier(otherIdentifier)
        .or(() -> personRepository.findByOtherIdentifier(hashedOtherIdentifier));

    final Person person = optionalExistingPerson.orElse(new Person());
    person.setLastName(lastName);
    person.setFirstName(firstName);
    person.setOid(oid);
    person.setOtherIdentifier(otherIdentifier);
    person.setLatestIdentifiedAt(LocalDateTime.now());

    return personRepository.saveAndFlush(person);
  }
}
