package fi.oph.yki.service;

import com.fasterxml.jackson.databind.JsonNode;
import fi.oph.yki.config.CacheConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class KoodistoService {

  private final WebClient koodistoClient;

  @Cacheable(CacheConfig.KOODISTO_CACHE)
  public JsonNode getCodes(final String collection) {
    return koodistoClient
      .get()
      .uri(uriBuilder ->
        uriBuilder.path("/rest/json/{collection}/koodi").queryParam("onlyValidKoodis", true).build(collection)
      )
      .retrieve()
      .bodyToMono(JsonNode.class)
      .switchIfEmpty(
        Mono.error(() ->
          new RuntimeException(String.format("Empty response from koodisto for collection %s", collection))
        )
      )
      .block();
  }
}
