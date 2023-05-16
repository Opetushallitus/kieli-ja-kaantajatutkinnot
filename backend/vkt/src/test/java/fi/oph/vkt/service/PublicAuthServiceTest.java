package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.service.auth.ticketValidator.TicketValidator;
import java.util.Map;
import javax.annotation.Resource;
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

  @MockBean
  private TicketValidator ticketValidatorMock;

  private PublicAuthService publicAuthService;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);

    when(environment.getRequiredProperty("app.cas-oppija.login-url")).thenReturn("https://foo.bar");
    when(environment.getRequiredProperty("app.cas-oppija.service-url")).thenReturn("https://qwerty/login");

    final CasTicketValidationService casTicketValidationService = new CasTicketValidationService(ticketValidatorMock);

    final Map<String, String> personDetails = Map.ofEntries(
      Map.entry("identityNumber", "010280-952L"),
      Map.entry("firstName", "Tessa"),
      Map.entry("lastName", "Testilä")
    );
    when(casTicketValidationService.validate(anyString(), anyLong(), eq(EnrollmentType.RESERVATION))).thenReturn(personDetails);

    publicAuthService = new PublicAuthService(personRepository, casTicketValidationService, environment);
  }

  @Test
  public void testCreatePersonFromTicket() {
    final Person person = publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);
    assertEquals("010280-952L", person.getIdentityNumber());
    assertEquals("Testilä", person.getLastName());
    assertEquals("Tessa", person.getFirstName());

    assertTrue(personRepository.findByIdentityNumber("010280-952L").isPresent());
  }

  @Test
  public void testCreatePersonFromTicketForExistingPerson() {
    publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);

    final Person person = publicAuthService.createPersonFromTicket("ticket-123", 1L, EnrollmentType.RESERVATION);
    assertEquals("010280-952L", person.getIdentityNumber());
    assertEquals("Testilä", person.getLastName());
    assertEquals("Tessa", person.getFirstName());

    assertEquals(1, personRepository.count());
  }

  @Test
  public void testCreateCasLoginUrl() {
    final String casLoginUrl = publicAuthService.createCasLoginUrl(1L, EnrollmentType.RESERVATION);
    assertEquals("https://foo.bar?service=https%3A%2F%2Fqwerty%2Flogin", casLoginUrl);
  }
}
