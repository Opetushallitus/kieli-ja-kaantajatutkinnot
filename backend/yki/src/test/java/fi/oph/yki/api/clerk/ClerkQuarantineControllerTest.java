package fi.oph.yki.api.clerk;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchDTO;
import fi.oph.yki.service.ClerkQuarantineService;
import jakarta.annotation.Resource;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ClerkQuarantineController.class)
@TestPropertySource(properties = "app.clerk-enabled=true")
class ClerkQuarantineControllerTest {

  private static final String MATCHES_URL = "/v2/api/clerk/quarantine/matches";

  @Resource
  private MockMvc mockMvc;

  @MockBean
  private ClerkQuarantineService clerkQuarantineService;

  @Test
  @WithMockUser
  public void testGetQuarantineMatchesReturnsOkWithResponseShape() throws Exception {
    final ObjectNode form = new ObjectMapper().createObjectNode();
    form.put("ssn", "010675-9981");
    form.put("birthdate", "1975-06-01");

    final ClerkQuarantineMatchDTO match = new ClerkQuarantineMatchDTO(
      19L,
      "fin",
      "1975-06-01",
      Instant.parse("2025-12-16T12:20:36.140Z"),
      "010675-9981",
      "Anna-Liisa",
      "Salline<n",
      "salla@testi.fi",
      "+35840123456",
      1055L,
      form,
      "COMPLETED",
      LocalDate.of(2026, 5, 9),
      "fin"
    );

    when(clerkQuarantineService.getQuarantineMatches()).thenReturn(List.of(match));

    mockMvc
      .perform(get(MATCHES_URL))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$").isArray())
      .andExpect(jsonPath("$[0].id").value(19))
      .andExpect(jsonPath("$[0].quarantineLang").value("fin"))
      .andExpect(jsonPath("$[0].registrationId").value(1055))
      .andExpect(jsonPath("$[0].form.ssn").value("010675-9981"));
  }

  @Test
  public void testGetQuarantineMatchesRequiresAuthentication() throws Exception {
    mockMvc.perform(get(MATCHES_URL)).andExpect(status().isUnauthorized());
  }
}
