package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.model.CasTicket;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.AppLocale;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.repository.CasTicketRepository;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.service.auth.ticketValidator.TicketValidator;
import jakarta.annotation.Resource;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import javax.xml.parsers.ParserConfigurationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class PublicAuthServiceTest {

  @Resource
  private PersonRepository personRepository;

  @Resource
  private CasTicketRepository casTicketRepository;

  @MockBean
  private TicketValidator ticketValidatorMock;

  private PublicAuthService publicAuthService;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);

    when(environment.getRequiredProperty("app.cas-oppija.login-url")).thenReturn("https://foo.bar");
    when(environment.getRequiredProperty("app.cas-oppija.service-url"))
      .thenReturn("https://foo/vkt/api/v1/auth/validate/%s/%s");

    final CasTicketValidationService casTicketValidationService = new CasTicketValidationService(ticketValidatorMock);

    final Map<String, String> personDetails1 = Map.ofEntries(
      Map.entry("firstName", "Tessa"),
      Map.entry("lastName", "Testilä"),
      Map.entry("oid", "999"),
      Map.entry("otherIdentifier", "10000")
    );
    final Map<String, String> personDetails2 = Map.ofEntries(
      Map.entry("firstName", "Max"),
      Map.entry("lastName", "Syöttöpaine"),
      Map.entry("oid", "111"),
      Map.entry("otherIdentifier", "20000")
    );
    when(casTicketValidationService.validate(eq("ticket-123"), anyLong(), eq(EnrollmentType.RESERVATION)))
      .thenReturn(personDetails1);
    when(casTicketValidationService.validate(eq("ticket-124"), anyLong(), eq(EnrollmentType.RESERVATION)))
      .thenReturn(personDetails2);

    publicAuthService =
      new PublicAuthService(casTicketValidationService, personRepository, environment, casTicketRepository);
  }

  @Test
  public void testCreatePersonFromTicket() {
    final Person person = publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);

    assertPersonDetails(person);
    assertTrue(personRepository.findByOid("999").isPresent());
    assertTrue(casTicketRepository.findByPerson(person).isPresent());
  }

  @Test
  public void testCreatePersonFromTicketAndLogout() {
    final Person person = publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);

    publicAuthService.logout(person);

    assertTrue(casTicketRepository.findByPerson(person).isEmpty());
  }

  @Test
  public void testCreatePersonFromTicketAndCallbackLogout() throws ParserConfigurationException {
    final Person person1 = publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);
    final Person person2 = publicAuthService.createPersonFromTicket("ticket-124", 1L, EnrollmentType.RESERVATION);
    final String logoutRequest =
      "<samlp:LogoutRequest" +
      " xmlns:samlp=\"urn:oasis:names:tc:SAML:2.0:protocol\"" +
      " xmlns:saml=\"urn:oasis:names:tc:SAML:2.0:assertion\"" +
      " ID=\"[RANDOM ID]\"" +
      " Version=\"2.0\"" +
      " IssueInstant=\"[CURRENT DATE/TIME]\">" +
      "<saml:NameID>@NOT_USED@</saml:NameID>" +
      "<samlp:SessionIndex>ticket-123</samlp:SessionIndex>" +
      "</samlp:LogoutRequest>";

    assertTrue(casTicketRepository.findByPerson(person1).isPresent());
    assertTrue(casTicketRepository.findByPerson(person2).isPresent());

    publicAuthService.logout(logoutRequest);

    assertTrue(casTicketRepository.findByPerson(person1).isEmpty());
    assertTrue(casTicketRepository.findByPerson(person2).isPresent());
  }

  @Test
  public void testDeleteExpiredTokens() {
    final Person person = publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);
    final CasTicket casTicket = casTicketRepository.findByPerson(person).orElseThrow();

    final Duration ttl = Duration.of(3, ChronoUnit.HOURS);
    casTicket.setCreatedAt(LocalDateTime.now().minus(ttl));
    publicAuthService.createPersonFromTicket("ticket-124", 1L, EnrollmentType.RESERVATION);

    assertEquals(2, casTicketRepository.findAll().size());

    publicAuthService.deleteExpiredTokens();

    assertEquals(1, casTicketRepository.findAll().size());
  }

  @Test
  public void testCreatePersonFromTicketForExistingPerson() {
    final Person person = publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);
    final int originalVersion = person.getVersion();
    final LocalDateTime originalLatestIdentifiedAt = person.getLatestIdentifiedAt();
    final Person updatedPerson = publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);

    assertEquals(person.getId(), updatedPerson.getId());
    assertEquals(originalVersion + 1, updatedPerson.getVersion());
    assertTrue(originalLatestIdentifiedAt.isBefore(updatedPerson.getLatestIdentifiedAt()));
    assertPersonDetails(updatedPerson);
    assertEquals(1, personRepository.count());
  }

  private void assertPersonDetails(final Person person) {
    assertEquals("Testilä", person.getLastName());
    assertEquals("Tessa", person.getFirstName());
    assertEquals("999", person.getOid());
    assertEquals("10000", person.getOtherIdentifier());
  }

  @Test
  public void testCreateCasLoginUrl() {
    final String casLoginUrl = publicAuthService.createCasLoginUrl(1L, EnrollmentType.RESERVATION, AppLocale.FI);
    assertEquals(
      "https://foo.bar?service=https%3A%2F%2Ffoo%2Fvkt%2Fapi%2Fv1%2Fauth%2Fvalidate%2F1%2Freservation&locale=fi",
      casLoginUrl
    );
  }
}
