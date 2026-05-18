package fi.oph.yki.api.clerk;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.service.ClerkExamDateService;
import jakarta.annotation.Resource;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ClerkExamDateController.class)
@WithMockUser
@TestPropertySource(properties = "app.clerk-enabled=true")
class ClerkExamDateControllerTest {

  private static final String BASE_URL = "/v2/api/clerk/examDate";

  @Resource
  private MockMvc mockMvc;

  @MockitoBean
  private ClerkExamDateService clerkExamDateService;

  private static JSONObject validCreateData() {
    final JSONObject data = new JSONObject();
    data.put("examDate", "2026-10-15");
    data.put("registrationStartDate", "2026-08-01");
    data.put("registrationEndDate", "2026-09-30");
    data.put("examType", "FULL");

    final JSONObject lang = new JSONObject();
    lang.put("languageCode", "fin");
    lang.put("levelCode", "KESKI");
    final JSONArray languages = new JSONArray();
    languages.add(lang);
    data.put("languages", languages);

    return data;
  }

  @Test
  public void testCreateWithValidData() throws Exception {
    mockMvc
      .perform(
        post(BASE_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(validCreateData().toJSONString())
      )
      .andExpect(status().isOk());
  }

  @Test
  public void testCreateWithEmptyExamTypeReturnsBadRequest() throws Exception {
    final JSONObject data = validCreateData();
    data.put("examType", null);

    mockMvc
      .perform(post(BASE_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(data.toJSONString()))
      .andExpect(status().isBadRequest());
  }

  @Test
  public void testCreateWithEmptyLanguagesReturnsBadRequest() throws Exception {
    final JSONObject data = validCreateData();
    data.put("languages", new JSONArray());

    mockMvc
      .perform(post(BASE_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(data.toJSONString()))
      .andExpect(status().isBadRequest());
  }

  @Test
  public void testUpdateWithNoExamTypeReturnsBadRequest() throws Exception {
    final JSONObject data = validCreateData();
    data.put("examType", null);

    mockMvc
      .perform(put(BASE_URL + "/1").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(data.toJSONString()))
      .andExpect(status().isBadRequest());
  }

  @Test
  public void testUpdateWithEmptyLanguagesReturnsBadRequest() throws Exception {
    final JSONObject data = validCreateData();
    data.put("languages", new JSONArray());

    mockMvc
      .perform(put(BASE_URL + "/1").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(data.toJSONString()))
      .andExpect(status().isBadRequest());
  }

  private static JSONObject validEvaluationData() {
    final JSONObject lang = new JSONObject();
    lang.put("examDateLanguageId", 1);
    lang.put("evaluationStartDate", "2026-10-20");
    lang.put("evaluationEndDate", "2026-11-20");

    final JSONArray evaluations = new JSONArray();
    evaluations.add(lang);

    final JSONObject data = new JSONObject();
    data.put("evaluations", evaluations);

    return data;
  }

  @Test
  public void testUpdateEvaluationWithValidData() throws Exception {
    mockMvc
      .perform(
        put(BASE_URL + "/1/evaluation")
          .with(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(validEvaluationData().toJSONString())
      )
      .andExpect(status().isOk());
  }

  @Test
  public void testUpdateEvaluationWithEmptyListReturnsBadRequest() throws Exception {
    final JSONObject data = new JSONObject();
    data.put("evaluations", new JSONArray());

    mockMvc
      .perform(
        put(BASE_URL + "/1/evaluation")
          .with(csrf())
          .contentType(MediaType.APPLICATION_JSON)
          .content(data.toJSONString())
      )
      .andExpect(status().isBadRequest());
  }
}
