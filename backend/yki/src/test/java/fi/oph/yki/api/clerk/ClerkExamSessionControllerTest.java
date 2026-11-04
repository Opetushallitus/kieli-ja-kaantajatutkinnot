package fi.oph.yki.api.clerk;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.api.dto.clerk.ClerkExamSessionLocationDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionSummaryDTO;
import fi.oph.yki.service.ClerkExamSessionService;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ClerkExamSessionController.class)
@WithMockUser
class ClerkExamSessionControllerTest {

  private static final String URL = "/v2/api/clerk/examSession/summary";

  @Resource
  private MockMvc mockMvc;

  @MockitoBean
  private ClerkExamSessionService clerkExamSessionService;

  @Test
  void summariesContainOnlyModalFields() throws Exception {
    final var location = new ClerkExamSessionLocationDTO(
      "fi",
      "",
      "Testipaikka",
      "",
      "Testikatu 1",
      "Helsinki",
      "00100"
    );
    when(clerkExamSessionService.getExamSessionSummariesByLanguageAndLevel("swe", "YLIN"))
      .thenReturn(
        List.of(new ClerkExamSessionSummaryDTO(42L, LocalDate.of(2026, 8, 31), "swe", "YLIN", List.of(location)))
      );

    mockMvc
      .perform(get(URL).param("language", "swe").param("level", "YLIN"))
      .andExpect(status().isOk())
      .andExpect(
        content()
          .json(
            """
        [{"id":42,"date":"2026-08-31","language":"swe","level":"YLIN",
          "location":[{"lang":"fi","extraInformation":"","name":"Testipaikka",
            "otherLocationInfo":"","streetAddress":"Testikatu 1","postOffice":"Helsinki","zip":"00100"}]}]
        """,
            true
          )
      );
  }

  @Test
  void summariesRequireLanguageAndLevel() throws Exception {
    mockMvc.perform(get(URL).param("language", "swe")).andExpect(status().isBadRequest());
    mockMvc.perform(get(URL).param("level", "YLIN")).andExpect(status().isBadRequest());
  }

  @Test
  void summariesReturnEmptyListWhenNothingMatches() throws Exception {
    when(clerkExamSessionService.getExamSessionSummariesByLanguageAndLevel("swe", "YLIN")).thenReturn(List.of());
    mockMvc
      .perform(get(URL).param("language", "swe").param("level", "YLIN"))
      .andExpect(status().isOk())
      .andExpect(content().json("[]"));
  }
}
