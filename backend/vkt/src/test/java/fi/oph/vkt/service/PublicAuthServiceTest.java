package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.auth.CasTicketValidationService;
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
public class PublicAuthServiceTest {

  @Resource
  private PersonRepository personRepository;

  @MockBean
  private TicketValidator ticketValidatorMock;

  private PublicAuthService publicAuthService;

  @BeforeEach
  public void setup() {
    final CasTicketValidationService casTicketValidationService = new CasTicketValidationService(ticketValidatorMock);

    final Map<String, String> personDetails = Map.ofEntries(
      Map.entry("identityNumber", "010280-952L"),
      Map.entry("firstName", "Tessa"),
      Map.entry("lastName", "Testilä")
    );
    when(casTicketValidationService.validate(anyString())).thenReturn(personDetails);

    publicAuthService = new PublicAuthService(personRepository, casTicketValidationService);
  }

  @Test
  public void testCreatePersonFromTicket() {
    final PublicPersonDTO personDTO = publicAuthService.createPersonFromTicket("ticket-123");
    assertEquals("010280-952L", personDTO.identityNumber());
    assertEquals("Testilä", personDTO.lastName());
    assertEquals("Tessa", personDTO.firstName());

    assertTrue(personRepository.findByIdentityNumber("010280-952L").isPresent());
  }

  @Test
  public void testCreatePersonFromTicketForExistingPerson() {
    publicAuthService.createPersonFromTicket("ticket-123");

    final PublicPersonDTO personDTO = publicAuthService.createPersonFromTicket("ticket-123");
    assertEquals("010280-952L", personDTO.identityNumber());
    assertEquals("Testilä", personDTO.lastName());
    assertEquals("Tessa", personDTO.firstName());

    assertEquals(1, personRepository.count());
  }
}
