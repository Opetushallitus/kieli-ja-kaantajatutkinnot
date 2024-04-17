package fi.oph.vkt.service;

import fi.oph.vkt.model.CasTicket;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.AppLocale;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.repository.CasTicketRepository;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasSessionMappingStorage;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.util.SessionUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import fi.vm.sade.javautils.nio.cas.CasLogout;
import jakarta.servlet.http.HttpSession;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.apereo.cas.client.session.SessionMappingStorage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicAuthService {

  private static final Logger LOG = LoggerFactory.getLogger(PublicAuthService.class);

  private final CasTicketValidationService casTicketValidationService;
  private final PersonRepository personRepository;
  private final Environment environment;
  private final CasTicketRepository casTicketRepository;
  private final CasSessionMappingStorage sessionMappingStorage;

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

    final Person savedPerson = personRepository.saveAndFlush(person);

    final CasTicket casTicket = casTicketRepository.findByPerson(savedPerson).orElse(new CasTicket());
    final LocalDateTime now = LocalDateTime.now();
    casTicket.setPerson(savedPerson);
    casTicket.setTicket(ticket);
    casTicket.setCreatedAt(now);

    casTicketRepository.saveAndFlush(casTicket);

    return savedPerson;
  }

  @Transactional
  public void logout(final String logoutRequest) {
    final CasLogout casLogout = new CasLogout();
    final Optional<String> ticket = casLogout.parseTicketFromLogoutRequest(logoutRequest);

    ticket.ifPresent(casTicketRepository::deleteAllByTicket);
  }

  @Transactional
  public void logout(final Person person) {
    casTicketRepository.deleteAllByPerson(person);
  }

  @Transactional
  public void logout(final HttpSession session) {
    if (SessionUtil.hasPersonId(session)) {
      final Long personId = SessionUtil.getPersonId(session);
      final Optional<Person> person = personRepository.findById(personId);

      person.ifPresent(this::logout);
    }
  }

  @Transactional(readOnly = true)
  public Boolean hasTicket(final HttpSession session) {
    return !sessionMappingStorage.getSessionMappingId(session).isEmpty();
  }

  @Transactional(readOnly = true)
  public Person getPersonFromSession(final HttpSession session) {
    if (!SessionUtil.hasPersonId(session)) {
      throw new NotFoundException("Person not found from session");
    }

    final Long personId = SessionUtil.getPersonId(session);
    final Optional<Person> person = personRepository.findById(personId);

    if (person.isEmpty()) {
      throw new NotFoundException("Person not found from repository");
    }

    if (!hasTicket(session)) {
      throw new NotFoundException("Person does not have valid ticket");
    }

    return person.get();
  }

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void deleteExpiredTokens() {
    // Pretty much arbitrary ttl after expiry time of a reservation
    final Duration ttl = Duration.of(2, ChronoUnit.HOURS);

    casTicketRepository
      .findByCreatedAtIsBefore(LocalDateTime.now().minus(ttl))
      .forEach(casTicket -> casTicketRepository.deleteById(casTicket.getId()));
  }
}
