package fi.oph.yki.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.config.CacheConfig;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.util.HttpConstants.Methods;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class PermissionsClient {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
    .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

  private final CasClient casClient;
  private final RequestBuilder defaultRequestBuilder;
  private final String kayttooikeusServiceUrl;

  public PermissionsClient(
    CasClient casClient,
    @Qualifier("casRequestBuilder") RequestBuilder requestBuilder,
    @Value("${app.kayttooikeus-service.url}") String kayttooikeusServiceUrl
  ) {
    this.casClient = casClient;
    this.defaultRequestBuilder = requestBuilder;
    this.kayttooikeusServiceUrl = kayttooikeusServiceUrl;
  }

  @Cacheable(CacheConfig.PERMISSIONS_CACHE)
  public Map<String, Object> getVirkailijaByUsername(final String username)
    throws ExecutionException, InterruptedException, JsonProcessingException {
    final Request request = defaultRequestBuilder
      .setUrl(kayttooikeusServiceUrl + "/kayttooikeus/kayttaja?username=" + username)
      .setMethod(Methods.GET)
      .build();

    final Response response = casClient.executeBlocking(request);
    if (response.getStatusCode() != HttpStatus.OK.value()) {
      throw new RuntimeException(
        "Could not get virkailija by username " + username + ", status: " + response.getStatusCode()
      );
    }

    final List<Map<String, Object>> results = OBJECT_MAPPER.readValue(
      response.getResponseBody(),
      new TypeReference<>() {}
    );

    if (results.isEmpty()) {
      throw new RuntimeException("No virkailija found by username " + username);
    }

    return results.get(0);
  }
}
