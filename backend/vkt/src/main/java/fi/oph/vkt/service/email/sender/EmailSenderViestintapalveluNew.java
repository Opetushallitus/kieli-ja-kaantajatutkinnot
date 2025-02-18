package fi.oph.vkt.service.email.sender;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.service.email.EmailAttachmentData;
import fi.oph.vkt.service.email.EmailData;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutionException;

import lombok.RequiredArgsConstructor;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.util.HttpConstants;
import org.springframework.http.MediaType;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class EmailSenderViestintapalveluNew implements EmailSender {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  private final CasClient casClient;

  private final String callerId;

  private final String sender;

  @Override
  public String sendEmail(final EmailData emailData) throws JsonProcessingException, ExecutionException, InterruptedException {
    final ObjectMapper objectMapper = new ObjectMapper();
    final Map<String, Object> postData = createPostData(emailData);
    final String body = objectMapper.writeValueAsString(postData);

    final Request request = new RequestBuilder()
      .setUrl("https://viestinvalitys.testiopintopolku.fi/lahetys/v1/viestit")
      .setMethod("POST")
      .setBody(body)
      .setRequestTimeout(Duration.ofMillis(10000))
      .addHeader("Caller-Id", callerId)
      .addHeader("Content-Type", "application/json")
      .addHeader("Accept", "application/json")
      .build();

    try {
      final Response response = casClient.executeAndRetryWithCleanSessionOnStatusCodes(request, Set.of(401)).get();

      if (response.getStatusCode() == HttpConstants.ResponseStatusCodes.OK_200) {
        return parseExternalId(response.getResponseBody());
      }
    } catch (Exception e) {
      throw e;
    }

    return null;
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
      "html",
      "lahettavaPalvelu",
      "vkt",
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
      emailKeyPrefix + emailData.id()
      //"attachments",
      //createAttachments(emailData.attachments())
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
