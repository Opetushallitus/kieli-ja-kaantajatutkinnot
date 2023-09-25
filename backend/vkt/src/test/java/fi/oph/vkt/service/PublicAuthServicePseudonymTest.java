package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.AppLocale;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.service.auth.ticketValidator.TicketValidator;
import fi.oph.vkt.util.StringUtil;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class PublicAuthServicePseudonymTest {

  @Resource
  private PersonRepository personRepository;

  @MockBean
  private TicketValidator ticketValidatorMock;

  private PublicAuthService publicAuthService;

  @Resource
  private TestEntityManager entityManager;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);

    when(environment.getRequiredProperty("salt")).thenReturn("foobar");
    when(environment.getRequiredProperty("app.cas-oppija.login-url")).thenReturn("https://foo.bar");
    when(environment.getRequiredProperty("app.cas-oppija.service-url"))
      .thenReturn("https://foo/vkt/api/v1/auth/validate/%s/%s");

    final CasTicketValidationService casTicketValidationService = new CasTicketValidationService(ticketValidatorMock);

    final Map<String, String> personDetails = Map.ofEntries(
      Map.entry("firstName", "Tessa"),
      Map.entry("lastName", "Testilä"),
      Map.entry("otherIdentifier", "10000")
    );
    when(casTicketValidationService.validate(anyString(), anyLong(), eq(EnrollmentType.RESERVATION)))
      .thenReturn(personDetails);

    publicAuthService = new PublicAuthService(casTicketValidationService, personRepository, environment);
  }

  @Test
  public void testCreatePersonFromTicketForPseudonymPerson() {
    final Person person = publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);
    final int originalVersion = person.getVersion();

    person.setOtherIdentifier(StringUtil.getHash(person.getOtherIdentifier(), "foobar"));
    entityManager.persist(person);

    final LocalDateTime originalLatestIdentifiedAt = person.getLatestIdentifiedAt();
    final Person updatedPerson = publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);

    assertEquals(person.getId(), updatedPerson.getId());
    assertEquals(originalVersion + 2, updatedPerson.getVersion());
    assertTrue(originalLatestIdentifiedAt.isBefore(updatedPerson.getLatestIdentifiedAt()));
    assertPersonDetails(updatedPerson);
    assertEquals(1, personRepository.count());
  }

  private void assertPersonDetails(final Person person) {
    assertEquals("Testilä", person.getLastName());
    assertEquals("Tessa", person.getFirstName());
    assertEquals("10000", person.getOtherIdentifier());
  }
}
