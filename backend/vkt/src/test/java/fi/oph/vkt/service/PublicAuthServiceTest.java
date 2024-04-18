package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.AppLocale;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.repository.CasTicketRepository;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasSessionMappingStorage;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.service.auth.ticketValidator.TicketValidator;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.Map;
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
    final CasSessionMappingStorage casSessionMappingStorage = mock(CasSessionMappingStorage.class);

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
      new PublicAuthService(
        casTicketValidationService,
        personRepository,
        environment,
        casTicketRepository,
        casSessionMappingStorage
      );
  }

  @Test
  public void testCreatePersonFromTicket() {
    final Person person = publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);

    assertPersonDetails(person);
    assertTrue(personRepository.findByOid("999").isPresent());
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
