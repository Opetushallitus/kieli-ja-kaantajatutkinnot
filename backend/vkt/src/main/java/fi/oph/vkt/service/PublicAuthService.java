package fi.oph.vkt.service;

import fi.oph.vkt.model.CasTicket;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.AppLocale;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.repository.CasTicketRepository;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.util.SessionUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.vm.sade.javautils.nio.cas.CasLogout;
import jakarta.servlet.http.HttpSession;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicAuthService {

  private static final Logger LOG = LoggerFactory.getLogger(PublicAuthService.class);

  private final CasTicketValidationService casTicketValidationService;
  private final PersonRepository personRepository;
  private final Environment environment;
  private final CasTicketRepository casTicketRepository;

  public String createCasLoginUrl(final long examEventId, final EnrollmentType type, final AppLocale appLocale) {
    final String casLoginUrl = environment.getRequiredProperty("app.cas-oppija.login-url");
    final String casServiceUrl = URLEncoder.encode(
      String.format(environment.getRequiredProperty("app.cas-oppija.service-url"), examEventId, type),
      StandardCharsets.UTF_8
    );
    return casLoginUrl + "?service=" + casServiceUrl + "&locale=" + appLocale.name().toLowerCase();
  }

  public String createCasLogoutUrl() {
    final String casLogoutUrl = environment.getRequiredProperty("app.cas-oppija.logout-url");
    final String casServiceUrl = URLEncoder.encode(
      environment.getRequiredProperty("app.cas-oppija.service-logout-url"),
      StandardCharsets.UTF_8
    );
    return casLogoutUrl + "?service=" + casServiceUrl;
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

    final Optional<Person> optionalExistingPerson = oid != null && !oid.isEmpty()
      ? personRepository.findByOid(oid)
      : personRepository.findByOtherIdentifier(otherIdentifier);

    final Person person = optionalExistingPerson.orElse(new Person());
    person.setLastName(lastName);
    person.setFirstName(firstName);
    person.setOid(oid);
    person.setOtherIdentifier(otherIdentifier);
    person.setLatestIdentifiedAt(LocalDateTime.now());

    personRepository.saveAndFlush(person);

    final CasTicket casTicket = casTicketRepository.findByPerson(person).orElse(new CasTicket());
    casTicket.setPerson(person);
    casTicket.setTicket(ticket);
    casTicketRepository.saveAndFlush(casTicket);

    return person;
  }

  public void logout(final String logoutRequest) {
    final CasLogout casLogout = new CasLogout();
    final Optional<String> ticket = casLogout.parseTicketFromLogoutRequest(logoutRequest);

    ticket.ifPresent(casTicketRepository::deleteAllByTicket);
  }

  public void logout(final Person person) {
    casTicketRepository.deleteAllByPerson(person);
  }

  public void logout(final HttpSession session) {
    if (SessionUtil.hasPersonId(session)) {
      final Long personId = SessionUtil.getPersonId(session);
      final Optional<Person> person = personRepository.findById(personId);

      person.ifPresent(this::logout);
    }
  }
}
