package fi.oph.yki.api;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.api.dto.PublicExamSessionDTO;
import fi.oph.yki.config.ControllerExceptionAdvice;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.service.PublicExamSessionService;
import jakarta.annotation.Resource;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PublicExamSessionController.class)
@Import(ControllerExceptionAdvice.class)
@TestPropertySource(properties = "app.v2.enabled=true")
@WithMockUser
class PublicExamSessionControllerTest {

  private static final String BASE_URL = "/api/v2/public/exam-session";

  @Resource
  private MockMvc mockMvc;

  @MockitoBean
  private PublicExamSessionService publicExamSessionService;

  @Test
  public void testExamSessions() throws Exception {
    final PublicExamSessionDTO fullExamSession = PublicExamSessionDTO
      .builder()
      .id(7L)
      .languageCode("fin")
      .levelCode("PERUS")
      .type(ExamSessionType.FULL)
      .publishedAt("2025-11-10T07:55:20.899Z")
      .location(List.of())
      .examFee(new BigDecimal("165"))
      .build();
    final PublicExamSessionDTO partialExamSession = PublicExamSessionDTO
      .builder()
      .id(8L)
      .languageCode("fin")
      .levelCode("KESKI")
      .type(ExamSessionType.LISTEN_WRITE)
      .location(List.of())
      .examFee(new BigDecimal("113"))
      .examFeeReadListen(new BigDecimal("43"))
      .examFeeSpeakWrite(new BigDecimal("70"))
      .build();

    when(publicExamSessionService.getUpcomingExamSessions()).thenReturn(List.of(fullExamSession, partialExamSession));

    mockMvc
      .perform(get(BASE_URL))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.exam_sessions[0].id").value(7))
      .andExpect(jsonPath("$.exam_sessions[0].language_code").value("fin"))
      .andExpect(jsonPath("$.exam_sessions[0].type").value("FULL"))
      .andExpect(jsonPath("$.exam_sessions[0].published_at").value("2025-11-10T07:55:20.899Z"))
      .andExpect(jsonPath("$.exam_sessions[0].exam_fee").value(165))
      .andExpect(jsonPath("$.exam_sessions[0].exam_fee_read_listen").doesNotExist())
      .andExpect(jsonPath("$.exam_sessions[0].exam_fee_speak_write").doesNotExist())
      .andExpect(jsonPath("$.exam_sessions[1].published_at").value(nullValue()))
      .andExpect(jsonPath("$.exam_sessions[1].exam_fee").value(113))
      .andExpect(jsonPath("$.exam_sessions[1].exam_fee_read_listen").value(43))
      .andExpect(jsonPath("$.exam_sessions[1].exam_fee_speak_write").value(70));
  }

  @Test
  public void testExamSessionsAreCacheable() throws Exception {
    when(publicExamSessionService.getUpcomingExamSessions()).thenReturn(List.of());

    mockMvc
      .perform(get(BASE_URL))
      .andExpect(status().isOk())
      .andExpect(header().string("Cache-Control", "max-age=2, public"))
      .andExpect(header().doesNotExist("Pragma"))
      .andExpect(header().doesNotExist("Expires"));
  }
}
