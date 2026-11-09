package fi.oph.yki.api.clerk;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.config.ControllerExceptionAdvice;
import fi.oph.yki.service.email.EmailService;
import fi.oph.yki.util.exception.NotFoundException;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

class EmailDebugControllerTest {

  private static final String BASE_URL = "/v2/api/clerk/email-debug";

  @Nested
  @WebMvcTest(EmailDebugController.class)
  @Import(ControllerExceptionAdvice.class)
  @WithMockUser
  @ActiveProfiles("dev")
  class WithDevProfile {

    @Resource
    private MockMvc mockMvc;

    @MockitoBean
    private EmailService emailService;

    @Test
    public void testRenderEmail() throws Exception {
      when(emailService.getEmailBody(1L)).thenReturn("<html><body>Maksulinkki</body></html>");

      mockMvc
        .perform(get(BASE_URL + "/1"))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
        .andExpect(content().string("<html><body>Maksulinkki</body></html>"));
    }

    @Test
    public void testRenderMissingEmailReturnsNotFound() throws Exception {
      when(emailService.getEmailBody(2L)).thenThrow(new NotFoundException("Email not found"));

      mockMvc.perform(get(BASE_URL + "/2")).andExpect(status().isNotFound());
    }
  }

  @Nested
  @WebMvcTest(EmailDebugController.class)
  @Import(ControllerExceptionAdvice.class)
  @WithMockUser
  class WithoutDevProfile {

    @Resource
    private MockMvc mockMvc;

    @MockitoBean
    private EmailService emailService;

    @Test
    public void testEndpointDoesNotExist() throws Exception {
      mockMvc.perform(get(BASE_URL + "/1")).andExpect(status().isNotFound());
    }
  }
}
