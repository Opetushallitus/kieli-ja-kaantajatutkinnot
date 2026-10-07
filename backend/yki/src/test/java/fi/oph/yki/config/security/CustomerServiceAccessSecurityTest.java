package fi.oph.yki.config.security;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.kayttooikeus.PermissionsService;
import fi.oph.yki.kayttooikeus.dto.KayttooikeusDTO;
import fi.oph.yki.kayttooikeus.dto.KayttooikeusResponseDTO;
import fi.oph.yki.kayttooikeus.dto.OrganisaatioDTO;
import fi.oph.yki.service.ClerkCustomerService;
import fi.oph.yki.service.ClerkExamDateService;
import fi.oph.yki.service.ClerkExamSessionService;
import fi.oph.yki.service.ClerkOrganizerService;
import fi.oph.yki.service.ClerkRegistrationService;
import fi.oph.yki.service.PersonService;
import jakarta.annotation.Resource;
import java.util.List;
import net.minidev.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test-postgres")
@Import(PostgresTestcontainerConfig.class)
class CustomerServiceAccessSecurityTest {

  private static final String CUSTOMER_SERVICE_ROLE = "APP_YKI_ILMOITTAUTUMISET_R";
  private static final String PERSON_OID = "1.2.246.562.24.00000000001";
  private static final String ORGANIZATION_OID = "1.2.246.562.10.00000000002";

  @Value("${app.base-url.clerk}")
  private String baseUrl;

  @Resource
  private MockMvc mockMvc;

  @MockitoBean
  private ClerkCustomerService clerkCustomerService;

  @MockitoBean
  private PersonService personService;

  @MockitoBean
  private ClerkOrganizerService clerkOrganizerService;

  @MockitoBean
  private ClerkExamDateService clerkExamDateService;

  @MockitoBean
  private ClerkExamSessionService clerkExamSessionService;

  @MockitoBean
  private ClerkRegistrationService clerkRegistrationService;

  @MockitoBean
  private PermissionsService permissionsService;

  @BeforeEach
  public void setUp() {
    final OrganisaatioDTO organisaatioDTO = new OrganisaatioDTO(
      ORGANIZATION_OID,
      List.of(new KayttooikeusDTO("YKI", "ILMOITTAUTUMISET_R"))
    );
    Mockito
      .when(permissionsService.getPermissionForUser(ArgumentMatchers.anyString()))
      .thenReturn(
        new KayttooikeusResponseDTO("1.2.246.562.24.00000000002", "user", "VIRKAILIJA", List.of(organisaatioDTO))
      );
    Mockito
      .when(clerkExamSessionService.getExamSessionExcel(ArgumentMatchers.anyLong()))
      .thenReturn(Mockito.mock(AbstractXlsxView.class));
  }

  private static String contactDetails() {
    final JSONObject data = new JSONObject();
    data.put("email", "test@example.com");
    data.put("phoneNumber", "+358401234567");
    data.put("streetAddress", "Testikatu 1");
    data.put("postOffice", "Jyväskylä");
    data.put("zip", "40100");
    return data.toJSONString();
  }

  private void expectCustomerServiceEndpoints(final ResultMatcher expected) throws Exception {
    mockMvc
      .perform(post("/v2/api/clerk/customer/search").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
      .andExpect(expected);
    mockMvc.perform(get("/v2/api/clerk/customer/" + PERSON_OID)).andExpect(expected);
    mockMvc.perform(get("/v2/api/clerk/organizer")).andExpect(expected);
    mockMvc.perform(get("/v2/api/clerk/examDate")).andExpect(expected);
    mockMvc.perform(get("/v2/api/clerk/examDate/all")).andExpect(expected);
    mockMvc.perform(get("/v2/api/clerk/examSession/1")).andExpect(expected);
    mockMvc.perform(get("/v2/api/clerk/examSession/1/excel")).andExpect(expected);
    mockMvc
      .perform(
        post("/v2/api/clerk/person/" + PERSON_OID + "/contactDetails")
          .with(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(contactDetails())
      )
      .andExpect(expected);
  }

  private void expectCustomerServicePages(final ResultMatcher expected) throws Exception {
    mockMvc.perform(get("/v2/virkailija/asiakashaku")).andExpect(expected);
    mockMvc.perform(get("/v2/virkailija/asiakashaku/" + PERSON_OID)).andExpect(expected);
    mockMvc.perform(get("/v2/virkailija/jarjestajarekisteri")).andExpect(expected);
    mockMvc
      .perform(get("/v2/virkailija/jarjestajarekisteri/" + ORGANIZATION_OID + "/tutkintotilaisuudet"))
      .andExpect(expected);
    mockMvc.perform(get("/v2/virkailija/tilaisuus/1")).andExpect(expected);
  }

  @Test
  @WithMockUser(roles = CUSTOMER_SERVICE_ROLE)
  public void testCustomerServiceCanUseCustomerServiceEndpointsAndPages() throws Exception {
    expectCustomerServiceEndpoints(status().isOk());
    expectCustomerServicePages(status().isOk());
  }

  @Test
  @WithMockUser(roles = CUSTOMER_SERVICE_ROLE)
  public void testCustomerServiceCannotMoveOrCancelRegistrations() throws Exception {
    mockMvc.perform(put("/v2/api/clerk/registration/1/move/2").with(csrf())).andExpect(status().isForbidden());
    mockMvc.perform(delete("/v2/api/clerk/registration/1/cancel").with(csrf())).andExpect(status().isForbidden());
    mockMvc
      .perform(get("/v2/api/clerk/examSession").param("language", "fin").param("level", "KESKI"))
      .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = CUSTOMER_SERVICE_ROLE)
  public void testCustomerServiceCannotModifyOrganizersOrExamSessions() throws Exception {
    mockMvc
      .perform(
        put("/v2/api/clerk/organizer/" + ORGANIZATION_OID)
          .with(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content("{}")
      )
      .andExpect(status().isForbidden());
    mockMvc
      .perform(post("/v2/api/clerk/organizer/add").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
      .andExpect(status().isForbidden());
    mockMvc
      .perform(post("/v2/api/clerk/examSession").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
      .andExpect(status().isForbidden());
    mockMvc
      .perform(put("/v2/api/clerk/examSession/1").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
      .andExpect(status().isForbidden());
    mockMvc
      .perform(post("/v2/api/clerk/examDate").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
      .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = CUSTOMER_SERVICE_ROLE)
  public void testCustomerServiceCannotUseOtherAdminEndpointsAndPages() throws Exception {
    mockMvc.perform(get("/v2/api/clerk/quarantine/")).andExpect(status().isForbidden());
    mockMvc
      .perform(get("/v2/api/clerk/organizer/" + ORGANIZATION_OID + "/exam-session"))
      .andExpect(status().isForbidden());
    mockMvc.perform(get("/v2/virkailija/tutkintopaivat")).andExpect(status().isForbidden());
    mockMvc.perform(get("/v2/virkailija/jarjestajarekisteri/lisaa")).andExpect(status().isForbidden());
    mockMvc.perform(get("/v2/virkailija/osallistumiskiellot")).andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = CUSTOMER_SERVICE_ROLE)
  public void testCustomerServiceCanReadButNotModifyOtherOrganizersData() throws Exception {
    mockMvc.perform(get("/v2/api/organizer/" + ORGANIZATION_OID + "/examSession")).andExpect(status().isOk());
    mockMvc
      .perform(
        post("/v2/api/organizer/" + ORGANIZATION_OID + "/examSession")
          .with(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content("{}")
      )
      .andExpect(status().isForbidden());
    mockMvc
      .perform(delete("/v2/api/organizer/" + ORGANIZATION_OID + "/registration/1").with(csrf()))
      .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = "APP_YKI_JARJESTAJA")
  public void testOrganizerCannotUseCustomerServiceEndpointsAndPages() throws Exception {
    expectCustomerServiceEndpoints(status().isForbidden());
    expectCustomerServicePages(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = "APP_YKI_YLLAPITAJA")
  public void testAdminCanUseCustomerServiceEndpointsAndPages() throws Exception {
    expectCustomerServiceEndpoints(status().isOk());
    expectCustomerServicePages(status().isOk());
  }

  @Test
  @WithMockUser(roles = CUSTOMER_SERVICE_ROLE)
  public void testCustomerServiceWithoutOrganizerRoleCanLogIn() throws Exception {
    mockMvc
      .perform(get("/v2/auth/user"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.isAdmin").value(false))
      .andExpect(jsonPath("$.isOrganizer").value(false))
      .andExpect(jsonPath("$.isCustomerService").value(true));
    mockMvc.perform(get("/v2/auth/login")).andExpect(redirectedUrl(baseUrl + "/v2/virkailija/jarjestajarekisteri"));
  }

  @Test
  @WithMockUser(roles = { CUSTOMER_SERVICE_ROLE, "APP_YKI_JARJESTAJA" })
  public void testCustomerServiceWithOrganizerRoleIsRedirectedToOrganizerRegister() throws Exception {
    mockMvc.perform(get("/v2/auth/login")).andExpect(redirectedUrl(baseUrl + "/v2/virkailija/jarjestajarekisteri"));
  }

  @Test
  @WithMockUser
  public void testUserWithoutYkiRolesCannotLogIn() throws Exception {
    mockMvc.perform(get("/v2/auth/user")).andExpect(status().isForbidden());
  }
}
