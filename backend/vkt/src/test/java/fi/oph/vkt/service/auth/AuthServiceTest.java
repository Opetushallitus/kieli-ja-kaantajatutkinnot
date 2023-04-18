package fi.oph.vkt.service.auth;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.PublicAuthService;
import fi.oph.vkt.service.auth.ticketValidator.TicketValidator;
import java.util.Map;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class AuthServiceTest {

  @Resource
  private PersonRepository personRepository;

  @MockBean
  private TicketValidator ticketValidatorMock;

  private CasTicketValidationService casTicketValidationService;

  private PublicAuthService publicAuthService;

  @BeforeEach
  public void setup() {
    casTicketValidationService = new CasTicketValidationService(ticketValidatorMock);

    publicAuthService = new PublicAuthService(personRepository, casTicketValidationService);
  }

  @Test
  public void testAuthentication() {
    final Map<String, String> personDetails = Map.ofEntries(
      Map.entry("identityNumber", "010280-952L"),
      Map.entry("firstName", "Tessa"),
      Map.entry("lastName", "Testilä")
    );
    when(casTicketValidationService.validate(anyString())).thenReturn(personDetails);
    publicAuthService.createPersonFromTicket("asdf");
    assertTrue(personRepository.findByIdentityNumber("010280-952L").isPresent());
  }
}
