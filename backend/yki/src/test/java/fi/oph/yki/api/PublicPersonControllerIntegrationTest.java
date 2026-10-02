package fi.oph.yki.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.PublicPersonDTO;
import fi.oph.yki.api.dto.PublicRegistrationToConfirmDTO;
import fi.oph.yki.service.KoodistoService;
import fi.oph.yki.service.PublicEvaluationService;
import fi.oph.yki.service.PublicPersonService;
import jakarta.annotation.Resource;
import java.util.List;
import net.minidev.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test-postgres")
@Import(PostgresTestcontainerConfig.class)
@TestPropertySource(properties = "app.customer-portal.enabled=true")
class PublicPersonControllerIntegrationTest {

  private static final String PERSON_URL = "/v2/api/public/person";

  private static final String OID = "1.2.246.562.24.00000000001";

  @Resource
  private MockMvc mockMvc;

  @MockitoBean
  private PublicPersonService publicPersonService;

  @MockitoBean
  private PublicEvaluationService publicEvaluationService;

  @MockitoBean
  private KoodistoService koodistoService;

  private static PreAuthenticatedAuthenticationToken login() {
    return new PreAuthenticatedAuthenticationToken(OID, null, List.of());
  }

  @Test
  public void testGetPersonWithoutLoginIsUnauthorized() throws Exception {
    mockMvc.perform(get(PERSON_URL)).andExpect(status().isUnauthorized());

    verifyNoInteractions(publicPersonService);
  }

  @Test
  public void testGetRegistrationToConfirmWithoutLoginIsUnauthorized() throws Exception {
    mockMvc.perform(get(PERSON_URL + "/registration/1/confirm")).andExpect(status().isUnauthorized());

    verifyNoInteractions(publicPersonService);
  }

  @Test
  public void testUpdateContactDetailsWithoutLoginIsUnauthorized() throws Exception {
    mockMvc
      .perform(post(PERSON_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(contactDetails()))
      .andExpect(status().isUnauthorized());

    verifyNoInteractions(publicPersonService);
  }

  @Test
  public void testGetPersonWithLogin() throws Exception {
    when(publicPersonService.getPerson(anyString())).thenReturn(PublicPersonDTO.builder().build());

    mockMvc.perform(get(PERSON_URL).with(authentication(login()))).andExpect(status().isOk());

    verify(publicPersonService).getPerson(OID);
  }

  @Test
  public void testGetRegistrationToConfirmWithLogin() throws Exception {
    when(publicPersonService.getRegistrationToConfirm(anyString(), anyLong()))
      .thenReturn(PublicRegistrationToConfirmDTO.builder().build());

    mockMvc
      .perform(get(PERSON_URL + "/registration/1/confirm").with(authentication(login())))
      .andExpect(status().isOk());

    verify(publicPersonService).getRegistrationToConfirm(OID, 1L);
  }

  @Test
  public void testUpdateContactDetailsWithLogin() throws Exception {
    mockMvc
      .perform(
        post(PERSON_URL)
          .with(authentication(login()))
          .with(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(contactDetails())
      )
      .andExpect(status().isOk());

    verify(publicPersonService).updateContactDetails(eq(OID), any());
  }

  @Test
  public void testCodeIsOpenWithoutLogin() throws Exception {
    when(koodistoService.getCodes(anyString())).thenReturn(JsonNodeFactory.instance.arrayNode());

    mockMvc.perform(get("/v2/api/public/code/maatjavaltiot2")).andExpect(status().isOk());
  }

  @Test
  public void testEvaluationIsOpenWithoutLogin() throws Exception {
    mockMvc.perform(get("/v2/api/public/evaluation")).andExpect(status().isOk());
  }

  private static String contactDetails() {
    final JSONObject data = new JSONObject();
    data.put("email", "testi@example.com");
    data.put("phone_number", "0401234567");
    data.put("street_address", "Testikatu 1");
    data.put("post_office", "Helsinki");
    data.put("zip", "00100");
    data.put("country_code", "FIN");
    return data.toJSONString();
  }
}
