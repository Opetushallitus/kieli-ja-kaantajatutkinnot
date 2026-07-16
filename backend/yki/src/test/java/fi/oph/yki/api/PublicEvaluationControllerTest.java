package fi.oph.yki.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.api.dto.PublicEvaluationPeriodDTO;
import fi.oph.yki.config.ControllerExceptionAdvice;
import fi.oph.yki.service.PublicEvaluationService;
import fi.oph.yki.util.exception.NotFoundException;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PublicEvaluationController.class)
@Import(ControllerExceptionAdvice.class)
@WithMockUser
class PublicEvaluationControllerTest {

  private static final String BASE_URL = "/v2/api/public/evaluation";

  @Resource
  private MockMvc mockMvc;

  @MockitoBean
  private PublicEvaluationService publicEvaluationService;

  @Test
  public void testEvaluationPeriods() throws Exception {
    final PublicEvaluationPeriodDTO period = PublicEvaluationPeriodDTO
      .builder()
      .id(19L)
      .examDate(LocalDate.of(2026, 10, 15))
      .languageCode("fin")
      .levelCode("PERUS")
      .evaluationStartDate(LocalDate.of(2026, 10, 20))
      .evaluationEndDate(LocalDate.of(2026, 11, 5))
      .open(true)
      .build();

    when(publicEvaluationService.getUpcomingEvaluationPeriods()).thenReturn(List.of(period));

    mockMvc
      .perform(get(BASE_URL))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.evaluation_periods").isArray())
      .andExpect(jsonPath("$.evaluation_periods[0].id").value(19))
      .andExpect(jsonPath("$.evaluation_periods[0].exam_date").value("2026-10-15"))
      .andExpect(jsonPath("$.evaluation_periods[0].language_code").value("fin"))
      .andExpect(jsonPath("$.evaluation_periods[0].level_code").value("PERUS"))
      .andExpect(jsonPath("$.evaluation_periods[0].evaluation_start_date").value("2026-10-20"))
      .andExpect(jsonPath("$.evaluation_periods[0].evaluation_end_date").value("2026-11-05"))
      .andExpect(jsonPath("$.evaluation_periods[0].open").value(true));
  }

  @Test
  public void testNoEvaluationPeriodsReturnsEmptyArray() throws Exception {
    when(publicEvaluationService.getUpcomingEvaluationPeriods()).thenReturn(List.of());

    mockMvc
      .perform(get(BASE_URL))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.evaluation_periods").isArray())
      .andExpect(jsonPath("$.evaluation_periods").isEmpty());
  }

  @Test
  public void testEvaluationPeriodById() throws Exception {
    final PublicEvaluationPeriodDTO period = PublicEvaluationPeriodDTO
      .builder()
      .id(19L)
      .examDate(LocalDate.of(2026, 10, 15))
      .languageCode("fin")
      .levelCode("PERUS")
      .evaluationStartDate(LocalDate.of(2026, 10, 20))
      .evaluationEndDate(LocalDate.of(2026, 11, 5))
      .open(true)
      .build();

    when(publicEvaluationService.getEvaluationPeriod(19L)).thenReturn(period);

    mockMvc
      .perform(get(BASE_URL + "/19"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.id").value(19))
      .andExpect(jsonPath("$.exam_date").value("2026-10-15"))
      .andExpect(jsonPath("$.language_code").value("fin"))
      .andExpect(jsonPath("$.level_code").value("PERUS"))
      .andExpect(jsonPath("$.evaluation_start_date").value("2026-10-20"))
      .andExpect(jsonPath("$.evaluation_end_date").value("2026-11-05"))
      .andExpect(jsonPath("$.open").value(true));
  }

  @Test
  public void testUnknownEvaluationPeriodReturnsNotFound() throws Exception {
    when(publicEvaluationService.getEvaluationPeriod(404L)).thenThrow(new NotFoundException("Evaluation not found"));

    mockMvc.perform(get(BASE_URL + "/404")).andExpect(status().isNotFound());
  }

  @Test
  public void testNonNumericEvaluationPeriodIdReturnsNotFound() throws Exception {
    mockMvc.perform(get(BASE_URL + "/abc")).andExpect(status().isNotFound());
  }
}
