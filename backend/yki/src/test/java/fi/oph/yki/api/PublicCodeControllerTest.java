package fi.oph.yki.api;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.config.ControllerExceptionAdvice;
import fi.oph.yki.service.KoodistoService;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PublicCodeController.class)
@Import(ControllerExceptionAdvice.class)
@WithMockUser
class PublicCodeControllerTest {

  private static final String BASE_URL = "/v2/api/public/code";

  @Resource
  private MockMvc mockMvc;

  @Resource
  private ObjectMapper objectMapper;

  @MockitoBean
  private KoodistoService koodistoService;

  @Value("classpath:koodisto/maatjavaltiot2-response.json")
  private org.springframework.core.io.Resource maatjavaltiot2Response;

  @Test
  public void testCodesArePassedThroughUnchanged() throws Exception {
    when(koodistoService.getCodes("maatjavaltiot2"))
      .thenReturn(objectMapper.readTree(maatjavaltiot2Response.getInputStream()));

    mockMvc
      .perform(get(BASE_URL + "/maatjavaltiot2"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$", hasSize(2)))
      .andExpect(jsonPath("$[0].koodiArvo").value("246"))
      .andExpect(jsonPath("$[0].koodisto.koodistoUri").value("maatjavaltiot2"))
      .andExpect(jsonPath("$[0].metadata", hasSize(3)))
      .andExpect(jsonPath("$[0].metadata[0].nimi").value("Suomi"))
      .andExpect(jsonPath("$[0].metadata[0].kieli").value("FI"))
      .andExpect(jsonPath("$[1].koodiArvo").value("752"))
      .andExpect(jsonPath("$[1].metadata[1].nimi").value("Sverige"))
      .andExpect(jsonPath("$[1].metadata[1].kieli").value("SV"));
  }

  @Test
  public void testUpstreamFailureReturnsInternalServerError() throws Exception {
    when(koodistoService.getCodes("kieli")).thenThrow(new RuntimeException("koodisto unavailable"));

    mockMvc.perform(get(BASE_URL + "/kieli")).andExpect(status().isInternalServerError());
  }

  @Test
  public void testEncodedPathSyntaxIsNotRouted() throws Exception {
    mockMvc.perform(get(BASE_URL + "/maatjavaltiot2%2F..%2Fkoodi")).andExpect(status().is4xxClientError());
    verifyNoInteractions(koodistoService);
  }

  @Test
  public void testMissingCollectionIsNotRouted() throws Exception {
    mockMvc.perform(get(BASE_URL)).andExpect(status().isNotFound());
    verifyNoInteractions(koodistoService);
  }
}
