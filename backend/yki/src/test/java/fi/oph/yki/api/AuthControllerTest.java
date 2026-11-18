package fi.oph.yki.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.TestUtil;
import fi.oph.yki.config.ControllerExceptionAdvice;
import fi.oph.yki.kayttooikeus.PermissionsService;
import fi.vm.sade.javautils.nio.cas.CasClient;
import jakarta.annotation.Resource;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@Import({ ControllerExceptionAdvice.class, PermissionsService.class, AuthControllerTest.RequestBuilderConfig.class })
@TestPropertySource(
  properties = {
    "app.base-url.clerk=http://localhost/yki", "app.kayttooikeus-service.url=http://localhost/kayttooikeus",
  }
)
class AuthControllerTest {

  private static final String USER_OID = "1.2.246.562.24.32388211111";
  private static final String BASE_URL = "http://localhost/yki";

  private static final String NO_ORGANIZER_PERMISSION_RESPONSE =
    """
    [
      {
        "oidHenkilo": "1.2.246.562.24.32388211111",
        "username": "foo",
        "kayttajaTyyppi": "VIRKAILIJA",
        "organisaatiot": [
          {
            "organisaatioOid": "1.2.246.562.10.00000000003",
            "kayttooikeudet": [
              { "palvelu": "VKT", "oikeus": "JARJESTAJA" },
              { "palvelu": "YKI", "oikeus": "ILMOITTAUTUMISET_R" }
            ]
          }
        ]
      }
    ]
    """;

  @TestConfiguration
  static class RequestBuilderConfig {

    @Bean("casRequestBuilder")
    public RequestBuilder casRequestBuilder() {
      return new RequestBuilder();
    }
  }

  @Resource
  private MockMvc mockMvc;

  @MockitoBean
  private CasClient casClient;

  @Test
  @WithMockUser(username = USER_OID, roles = "APP_YKI_YLLAPITAJA")
  public void testLoginRedirectsAdminToExamDates() throws Exception {
    mockMvc
      .perform(get("/v2/auth/login"))
      .andExpect(status().isFound())
      .andExpect(redirectedUrl(BASE_URL + "/v2/virkailija/tutkintopaivat"));

    verifyNoInteractions(casClient);
  }

  @Test
  @WithMockUser(username = USER_OID, roles = "APP_YKI_ILMOITTAUTUMISET_R")
  public void testLoginRedirectsCustomerServiceToOrganizerRegister() throws Exception {
    mockMvc
      .perform(get("/v2/auth/login"))
      .andExpect(status().isFound())
      .andExpect(redirectedUrl(BASE_URL + "/v2/virkailija/jarjestajarekisteri"));

    verifyNoInteractions(casClient);
  }

  @Test
  @WithMockUser(username = USER_OID, roles = "APP_YKI_JARJESTAJA")
  public void testLoginRedirectsOrganizerToFirstOrganisationWithOrganizerPermission() throws Exception {
    mockKayttooikeusResponse(TestUtil.readResourceAsString("kayttooikeus/kayttooikeus-response.json"));

    mockMvc
      .perform(get("/v2/auth/login"))
      .andExpect(status().isFound())
      .andExpect(redirectedUrl(BASE_URL + "/v2/jarjestaja/" + PermissionsService.OPH_OID));
  }

  @Test
  @WithMockUser(username = USER_OID, roles = "APP_YKI_JARJESTAJA")
  public void testLoginWithoutOrganizerPermissionFails() throws Exception {
    mockKayttooikeusResponse(NO_ORGANIZER_PERMISSION_RESPONSE);

    mockMvc.perform(get("/v2/auth/login")).andExpect(status().isInternalServerError());
  }

  @Test
  @WithMockUser(username = USER_OID, roles = "APP_YKI_JARJESTAJA")
  public void testUserForOrganizerHasFirstOrganisationWithOrganizerPermission() throws Exception {
    mockKayttooikeusResponse(TestUtil.readResourceAsString("kayttooikeus/kayttooikeus-response.json"));

    mockMvc
      .perform(get("/v2/auth/user"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.oid").value(PermissionsService.OPH_OID))
      .andExpect(jsonPath("$.isAdmin").value(false))
      .andExpect(jsonPath("$.isOrganizer").value(true))
      .andExpect(jsonPath("$.isCustomerService").value(false));
  }

  @Test
  @WithMockUser(username = USER_OID, roles = "APP_YKI_YLLAPITAJA")
  public void testUserForAdminHasFirstOrganisation() throws Exception {
    mockKayttooikeusResponse(TestUtil.readResourceAsString("kayttooikeus/kayttooikeus-response.json"));

    mockMvc
      .perform(get("/v2/auth/user"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.oid").value("1.2.246.562.10.00000000002"))
      .andExpect(jsonPath("$.isAdmin").value(true))
      .andExpect(jsonPath("$.isOrganizer").value(false))
      .andExpect(jsonPath("$.isCustomerService").value(false));
  }

  @Test
  @WithMockUser(username = USER_OID, roles = "APP_YKI_ILMOITTAUTUMISET_R")
  public void testUserForCustomerServiceWithoutOrganizerPermission() throws Exception {
    mockKayttooikeusResponse(NO_ORGANIZER_PERMISSION_RESPONSE);

    mockMvc
      .perform(get("/v2/auth/user"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.oid").value("1.2.246.562.10.00000000003"))
      .andExpect(jsonPath("$.isAdmin").value(false))
      .andExpect(jsonPath("$.isOrganizer").value(false))
      .andExpect(jsonPath("$.isCustomerService").value(true));
  }

  @Test
  @WithMockUser(username = USER_OID, roles = "APP_YKI_JARJESTAJA")
  public void testUserForOrganizerWithoutOrganizerPermissionFails() throws Exception {
    mockKayttooikeusResponse(NO_ORGANIZER_PERMISSION_RESPONSE);

    mockMvc.perform(get("/v2/auth/user")).andExpect(status().isInternalServerError());
  }

  private void mockKayttooikeusResponse(final String body) throws Exception {
    final Response response = mock(Response.class);
    when(response.getStatusCode()).thenReturn(200);
    when(response.getResponseBody()).thenReturn(body);
    when(casClient.executeAndRetryWithCleanSessionOnStatusCodesBlocking(any(), any())).thenReturn(response);
  }
}
