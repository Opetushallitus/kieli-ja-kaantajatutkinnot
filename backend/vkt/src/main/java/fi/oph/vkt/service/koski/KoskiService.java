package fi.oph.vkt.service.koski;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.service.koski.dto.KoskiResponseDTO;
import fi.oph.vkt.service.koski.dto.RequestBody;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class KoskiService {

  private static final Logger LOG = LoggerFactory.getLogger(KoskiService.class);

  private final WebClient koskiClient;

  public KoskiResponseDTO findEducations(final String oid) {
    final ObjectMapper objectMapper = new ObjectMapper();
    final RequestBody body = new RequestBody(oid);

    try {
      final String bodyJson = objectMapper.writeValueAsString(body);
      final String response = koskiClient
        .post()
        .uri("/oid")
        .bodyValue(bodyJson)
        .exchangeToMono(clientResponse -> {
          if (clientResponse.statusCode().isError()) {
            return clientResponse.createException().flatMap(Mono::error);
          }
          return clientResponse.bodyToMono(String.class);
        })
        .block();

      return objectMapper.readValue(response, KoskiResponseDTO.class);
    } catch (final WebClientResponseException e) {
      LOG.error(
        "KOSKI returned error status {}\n response body: {}",
        e.getStatusCode().value(),
        e.getResponseBodyAsString()
      );
      throw new RuntimeException(e);
    } catch (final Exception e) {
      throw new RuntimeException(e);
    }
  }
}
