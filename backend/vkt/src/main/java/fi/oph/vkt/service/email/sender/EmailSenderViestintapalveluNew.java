package fi.oph.vkt.service.email.sender;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.service.email.EmailAttachmentData;
import fi.oph.vkt.service.email.EmailData;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class EmailSenderViestintapalveluNew implements EmailSender {

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
    final Map<String, Object> senderFields = Map.of("nimi", sender, "sahkopostiOsoite", "noreply@opintopolku.fi");
    // Allowed characters: a-z, A-Z, 0-9 ja -_.
    final String emailKeyPrefix = "vkt-email-";
    final Integer expirationDays = 180; // 6 months

    final List<Map<String, String>> recipientFields = List.of(
      Map.of("nimi", emailData.recipientName(), "sahkopostiOsoite", emailData.recipientAddress())
    );

    return Map.of(
      "sisallonTyyppi",
      true,
      "lahettavaPalvelu",
      callingProcess,
      "lahettaja",
      senderFields,
      "otsikko",
      emailData.subject(),
      "sisalto",
      emailData.body(),
      "vastaanottajat",
      recipientFields,
      "prioriteetti",
      "normaali",
      "sailytysaika",
      expirationDays,
      "idempotencyKey",
      emailKeyPrefix + emailData.id(),
      "attachments",
      createAttachments(emailData.attachments())
    );
  }

  private List<Map<String, Object>> createAttachments(final List<EmailAttachmentData> attachments) {
    return Optional
      .ofNullable(attachments)
      .map(nonNullAttachments ->
        nonNullAttachments
          .stream()
          .map(a -> Map.<String, Object>of("data", a.data(), "name", a.name(), "contentType", a.contentType()))
          .toList()
      )
      .orElse(List.of());
  }

  private String parseExternalId(final String result) throws JsonProcessingException {
    final Map<String, String> map = OBJECT_MAPPER.readValue(result, new TypeReference<>() {});
    return map.get("id");
  }
}
