package fi.oph.yki.api.clerk;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.config.ControllerExceptionAdvice;
import fi.oph.yki.model.EmailType;
import fi.oph.yki.repository.EmailAttachmentListProjection;
import fi.oph.yki.repository.EmailListProjection;
import fi.oph.yki.service.email.EmailAttachmentData;
import fi.oph.yki.service.email.EmailService;
import fi.oph.yki.util.exception.NotFoundException;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
      final EmailAttachmentListProjection attachment = mock(EmailAttachmentListProjection.class);
      when(attachment.getId()).thenReturn(3L);
      when(attachment.getEmailId()).thenReturn(7L);
      when(attachment.getName()).thenReturn("kuitti<1>.pdf");
      when(emailService.listAttachments(List.of(7L))).thenReturn(Map.of(7L, List.of(attachment)));

      mockMvc
        .perform(get(BASE_URL))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
        .andExpect(content().string(containsString("<a href=\"email-debug/7\">7</a>")))
        .andExpect(content().string(containsString("<td>PAYMENT</td>")))
        .andExpect(content().string(containsString("<td>2026-11-09T12:30</td>")))
        .andExpect(content().string(containsString("Testi Henkilö &lt;testi@example.com&gt;")))
        .andExpect(content().string(containsString("<td>Maksu &lt;YKI&gt;</td>")))
        .andExpect(content().string(not(containsString("<YKI>"))))
        .andExpect(content().string(containsString("<a href=\"email-debug/7/attachment/3\">kuitti&lt;1&gt;.pdf</a>")));
    }

    @Test
    public void testGetAttachment() throws Exception {
      when(emailService.getAttachment(7L, 3L))
        .thenReturn(
          EmailAttachmentData
            .builder()
            .name("YKI-EXAM-1.pdf")
            .contentType("application/pdf")
            .data(new byte[] { '%', 'P', 'D', 'F' })
            .build()
        );

      mockMvc
        .perform(get(BASE_URL + "/7/attachment/3"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_PDF))
        .andExpect(header().string("Content-Disposition", "inline; filename=\"YKI-EXAM-1.pdf\""))
        .andExpect(content().bytes(new byte[] { '%', 'P', 'D', 'F' }));
    }

    @Test
    public void testGetMissingAttachmentReturnsNotFound() throws Exception {
      when(emailService.getAttachment(7L, 4L)).thenThrow(new NotFoundException("Email attachment not found"));

      mockMvc.perform(get(BASE_URL + "/7/attachment/4")).andExpect(status().isNotFound());
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

    @Test
    public void testAttachmentEndpointDoesNotExist() throws Exception {
      mockMvc.perform(get(BASE_URL + "/7/attachment/3")).andExpect(status().isNotFound());
    }
  }
}
