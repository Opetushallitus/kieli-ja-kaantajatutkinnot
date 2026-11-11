package fi.oph.yki.api.clerk;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.config.ControllerExceptionAdvice;
import fi.oph.yki.model.EmailType;
import fi.oph.yki.repository.EmailListProjection;
import fi.oph.yki.service.email.EmailService;
import fi.oph.yki.util.exception.NotFoundException;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;
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
    public void testListEmails() throws Exception {
      final EmailListProjection email = mock(EmailListProjection.class);
      when(email.getId()).thenReturn(7L);
      when(email.getEmailType()).thenReturn(EmailType.PAYMENT);
      when(email.getRecipientName()).thenReturn("Testi Henkilö");
      when(email.getRecipientAddress()).thenReturn("testi@example.com");
      when(email.getSubject()).thenReturn("Maksu <YKI>");
      when(email.getCreatedAt()).thenReturn(LocalDateTime.of(2026, 11, 9, 12, 30));
      when(emailService.listNewestEmails(200)).thenReturn(List.of(email));

      mockMvc
        .perform(get(BASE_URL))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
        .andExpect(content().string(containsString("<a href=\"email-debug/7\">7</a>")))
        .andExpect(content().string(containsString("<td>PAYMENT</td>")))
        .andExpect(content().string(containsString("<td>2026-11-09T12:30</td>")))
        .andExpect(content().string(containsString("Testi Henkilö &lt;testi@example.com&gt;")))
        .andExpect(content().string(containsString("<td>Maksu &lt;YKI&gt;</td>")))
        .andExpect(content().string(not(containsString("<YKI>"))));
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
    public void testRenderEndpointDoesNotExist() throws Exception {
      mockMvc.perform(get(BASE_URL + "/1")).andExpect(status().isNotFound());
    }

    @Test
    public void testListEndpointDoesNotExist() throws Exception {
      mockMvc.perform(get(BASE_URL)).andExpect(status().isNotFound());
    }
  }
}
