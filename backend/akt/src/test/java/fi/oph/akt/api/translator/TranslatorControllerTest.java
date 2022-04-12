package fi.oph.akt.api.translator;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.akt.service.ContactRequestService;
import fi.oph.akt.service.PublicTranslatorService;
import java.util.List;
import javax.annotation.Resource;
import net.minidev.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@WebMvcTest(TranslatorController.class)
class TranslatorControllerTest {

  @Resource
  private MockMvc mockMvc;

  @MockBean
  private PublicTranslatorService publicTranslatorService;

  @MockBean
  private ContactRequestService contactRequestService;

  @Test
  public void testValidContactRequest() throws Exception {
    final JSONObject data = validContactRequestData();

    postContactRequest(data).andExpect(status().isCreated());
  }

  @Test
  public void testValidContactRequestWithoutPhoneNumber() throws Exception {
    final JSONObject data = validContactRequestData();
    data.remove("phoneNumber");

    postContactRequest(data).andExpect(status().isCreated());
  }

  @Test
  public void testContactRequestWithEmptyData() throws Exception {
    final JSONObject data = new JSONObject();

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithBlankFirstName() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("firstName", " ");

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithTooLongFirstName() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("firstName", "x".repeat(256));

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithBlankLastName() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("lastName", " ");

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithTooLongLastName() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("lastName", "x".repeat(256));

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithBlankEmail() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("email", " ");

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithTooLongEmail() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("email", "x".repeat(256));

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithTooLongPhoneNumber() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("phoneNumber", "0".repeat(256));

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithBlankMessage() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("message", " ");

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithTooLongMessage() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("message", "x".repeat(6001));

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithBlankFromLang() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("fromLang", " ");

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithTooLongFromLang() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("fromLang", "x".repeat(11));

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithBlankToLang() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("toLang", " ");

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithTooLongToLang() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("toLang", "x".repeat(11));

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithNoTranslatorIds() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("translatorIds", List.of());

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  @Test
  public void testContactRequestWithInvalidTranslatorIds() throws Exception {
    final JSONObject data = validContactRequestData();
    data.put("translatorIds", List.of("a", "b"));

    postContactRequest(data).andExpect(status().isBadRequest());
  }

  private JSONObject validContactRequestData() {
    final JSONObject data = new JSONObject();
    data.put("firstName", "Foo");
    data.put("lastName", "Bar");
    data.put("email", "foo@bar");
    data.put("phoneNumber", "0409876543");
    data.put("message", "Lorem ipsum dolor sit amet");
    data.put("fromLang", "FI");
    data.put("toLang", "EN");
    data.put("translatorIds", List.of(56, 4));

    return data;
  }

  private ResultActions postContactRequest(JSONObject data) throws Exception {
    return mockMvc.perform(
      post("/api/v1/translator/contact-request")
        .contentType(MediaType.APPLICATION_JSON)
        .content(data.toJSONString())
        .with(csrf())
    );
  }
}
