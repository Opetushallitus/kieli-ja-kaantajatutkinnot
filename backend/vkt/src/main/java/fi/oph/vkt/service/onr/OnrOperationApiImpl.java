package fi.oph.vkt.service.onr;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.config.Constants;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import net.minidev.json.JSONArray;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.util.HttpConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

public class OnrOperationApiImpl implements OnrOperationApi {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
  private static final Logger LOG = LoggerFactory.getLogger(OnrOperationApiImpl.class);

  private final CasClient onrClient;

  private final String onrServiceUrl;

  public OnrOperationApiImpl(final CasClient onrClient, final String onrServiceUrl) {
    this.onrClient = onrClient;
    this.onrServiceUrl = onrServiceUrl;

    OBJECT_MAPPER.configure(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL, true);
  }

  @Override
  public Map<String, PersonalData> fetchPersonalDatas(final List<String> onrIds) throws Exception {
    // /henkilo/masterHenkilosByOidList might be usable as an endpoint for fetching master person data for persons
    // which have been marked passive
    final Request request = defaultRequestBuilder()
      .setUrl(onrServiceUrl + "/henkilo/henkilotByHenkiloOidList")
      .setMethod(HttpConstants.Methods.POST)
      .setBody(JSONArray.toJSONString(onrIds))
      .build();

    final Response response = onrClient.executeBlocking(request);

    if (response.getStatusCode() == HttpStatus.OK.value()) {
      final List<PersonalDataDTO> personalDataDTOS = OBJECT_MAPPER.readValue(
        response.getResponseBody(),
        new TypeReference<>() {}
      );

      final Map<String, PersonalData> personalDatas = new HashMap<>();
      personalDataDTOS.forEach(dto -> personalDatas.put(dto.getOnrId(), createPersonalData(dto)));
      return personalDatas;
    } else {
      throw new RuntimeException(
        "ONR service called with POST /henkilo/henkilotByHenkiloOidList returned unexpected status code: " +
        response.getStatusCode()
      );
    }
  }

  private PersonalData createPersonalData(final PersonalDataDTO personalDataDTO) {
    return PersonalData
      .builder()
      .onrId(personalDataDTO.getOnrId())
      .lastName(personalDataDTO.getLastName())
      .firstName(personalDataDTO.getFirstName())
      .nickname(personalDataDTO.getNickname())
      .build();
  }

  private RequestBuilder defaultRequestBuilder() {
    return new RequestBuilder()
      .addHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Caller-Id", Constants.CALLER_ID)
      .setRequestTimeout((int) TimeUnit.MINUTES.toMillis(2));
  }
}
