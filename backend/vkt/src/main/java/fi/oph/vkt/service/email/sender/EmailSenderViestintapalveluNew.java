package fi.oph.vkt.service.email.sender;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.config.Constants;
import fi.oph.vkt.service.email.EmailAttachmentData;
import fi.oph.vkt.service.email.EmailData;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.request.body.multipart.ByteArrayPart;
import org.asynchttpclient.util.HttpConstants;

@RequiredArgsConstructor
public class EmailSenderViestintapalveluNew implements EmailSender {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  private final CasClient casClient;

  private final String apiUrl;

  @Override
  public String sendEmail(final EmailData emailData) throws JsonProcessingException {
    final ObjectMapper objectMapper = new ObjectMapper();
    final List<String> attachments = createAndPostAttachments(emailData.attachments());
    final Map<String, Object> postData = createPostData(emailData, attachments);
    final String body = objectMapper.writeValueAsString(postData);

    final Request request = new RequestBuilder()
      .setUrl(apiUrl + "/lahetys/v1/viestit")
      .setMethod("POST")
      .setBody(body)
      .setRequestTimeout(Duration.ofSeconds(10))
      .addHeader("Caller-Id", Constants.CALLER_ID)
      .addHeader("Content-Type", "application/json")
      .addHeader("Accept", "application/json")
      .build();

    try {
      final Response response = casClient.executeAndRetryWithCleanSessionOnStatusCodes(request, Set.of(401)).get();

      if (response.getStatusCode() == HttpConstants.ResponseStatusCodes.OK_200) {
        return parseExternalId(response.getResponseBody(), "lahetysTunniste");
      } else {
        throw new RuntimeException(
          String.format("Failed to post send email with return status %s", response.getStatusCode())
        );
      }
    } catch (final Exception e) {
      throw new RuntimeException(e);
    }
  }

  private Map<String, Object> createPostData(final EmailData emailData, final List<String> attachments) {
    final Map<String, Object> senderFields = Map.of(
      "nimi",
      Constants.EMAIL_SENDER_NAME,
      "sahkopostiOsoite",
      Constants.EMAIL_SENDER_ADDRESS
    );

    final List<Map<String, String>> recipientFields = List.of(
      Map.of("nimi", emailData.recipientName(), "sahkopostiOsoite", emailData.recipientAddress())
    );

    return Map.of(
      "sisallonTyyppi",
      "html",
      "lahettavaPalvelu",
      Constants.SERVICENAME,
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
      Constants.EMAIL_EXPIRATION_DAYS,
      "idempotencyKey",
      Constants.EMAIL_ID_PREFIX + emailData.id(),
      "liitteidenTunnisteet",
      attachments
    );
  }

  private String postAttachment(final EmailAttachmentData attachment) {
    final Request request = new RequestBuilder()
      .setUrl(apiUrl + "/lahetys/v1/liitteet")
      .setMethod("POST")
      .addBodyPart(new ByteArrayPart("liite", attachment.data(), attachment.contentType(), null, attachment.name()))
      .setRequestTimeout(Duration.ofSeconds(10))
      .addHeader("Caller-Id", Constants.CALLER_ID)
      .addHeader("Content-Type", "multipart/form-data")
      .addHeader("Accept", "application/json")
      .build();

    try {
      final Response response = casClient.executeAndRetryWithCleanSessionOnStatusCodes(request, Set.of(401)).get();

      if (response.getStatusCode() == HttpConstants.ResponseStatusCodes.OK_200) {
        final String id = parseExternalId(response.getResponseBody(), "liiteTunniste");

        if (id == null) {
          throw new RuntimeException(String.format("Failed to receive id for attachment %s", attachment.name()));
        }

        return id;
      } else {
        throw new RuntimeException(
          String.format("Failed to post email attachment with return status %s", response.getStatusCode())
        );
      }
    } catch (final Exception e) {
      throw new RuntimeException(e);
    }
  }

  private List<String> createAndPostAttachments(final List<EmailAttachmentData> attachments) {
    return Optional
      .ofNullable(attachments)
      .map(nonNullAttachments ->
        nonNullAttachments
          .stream()
          .map(attachment -> {
            try {
              return postAttachment(attachment);
            } catch (final Exception e) {
              throw new RuntimeException(e);
            }
          })
          .toList()
      )
      .orElse(List.of());
  }

  private String parseExternalId(final String result, final String key) throws JsonProcessingException {
    final Map<String, String> map = OBJECT_MAPPER.readValue(result, new TypeReference<>() {});
    return map.get(key);
  }
}
