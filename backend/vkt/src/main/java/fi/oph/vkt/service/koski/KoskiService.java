package fi.oph.vkt.service.koski;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.service.koski.dto.KoskiResponseDTO;
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

  public KoskiResponseDTO findEducations() {
    final ObjectMapper objectMapper = new ObjectMapper();

    try {
      final String response = koskiClient
        .post()
        .uri("/oid")
        .bodyValue("{ \"oid\": \"1.2.246.562.24.97984579806\" }")
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
