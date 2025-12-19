package fi.oph.yki.onr;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.concurrent.ExecutionException;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.util.HttpConstants.Methods;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class OnrService {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  private final CasClient casClient;
  private final RequestBuilder defaultRequestBuilder;
  private final String onrServiceUrl;

  public OnrService(
    CasClient casClient,
    @Qualifier("casRequestBuilder") RequestBuilder requestBuilder,
    @Value("${cas.onr-url}") String onrServiceUrl
  ) {
    this.casClient = casClient;
    this.defaultRequestBuilder = requestBuilder;
    this.onrServiceUrl = onrServiceUrl;
  }

  public PersonalDataDTO getPersonalData(final String oidNumber)
    throws RuntimeException, ExecutionException, InterruptedException, JsonProcessingException {
    final Request request = defaultRequestBuilder
      .setUrl(onrServiceUrl + "/henkilo/" + oidNumber)
      .setMethod(Methods.GET)
      .build();

    final Response response = casClient.executeBlocking(request);
    if (response.getStatusCode() != HttpStatus.OK.value()) {
      throw new RuntimeException("Unexpected status code from ONR: " + response.getStatusCode());
    }

    final String json = response.getResponseBody();
    return OBJECT_MAPPER.readValue(json, new TypeReference<>() {});
  }
}
