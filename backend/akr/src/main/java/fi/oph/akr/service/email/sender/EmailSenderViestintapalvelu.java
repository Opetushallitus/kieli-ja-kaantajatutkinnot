package fi.oph.akr.service.email.sender;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.akr.service.email.EmailData;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class EmailSenderViestintapalvelu implements EmailSender {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  private final WebClient webClient;

  private final String callingProcess;

  private final String sender;

  @Override
  public String sendEmail(final EmailData emailData) throws JsonProcessingException {
    final Map<String, Object> postData = createPostData(emailData);

    final Mono<String> response = webClient
      .post()
      .contentType(MediaType.APPLICATION_JSON)
      .bodyValue(postData)
      .retrieve()
      .bodyToMono(String.class);

    final String result = response.block();

    return parseExternalId(result);
  }

  private Map<String, Object> createPostData(final EmailData emailData) {
    final Map<String, Object> emailFields = Map.of(
      "html",
      true,
      "charset",
      "UTF-8",
      "callingProcess",
      callingProcess,
      "sender",
      sender,
      "subject",
      emailData.subject(),
      "body",
      emailData.body()
    );

    final Map<String, String> recipientFields = Map.of(
      "name",
      emailData.recipientName(),
      "email",
      emailData.recipientAddress()
    );

    return Map.of("email", emailFields, "recipient", List.of(recipientFields));
  }

  private String parseExternalId(final String result) throws JsonProcessingException {
    final Map<String, String> map = OBJECT_MAPPER.readValue(result, new TypeReference<>() {});
    return map.get("id");
  }
}
