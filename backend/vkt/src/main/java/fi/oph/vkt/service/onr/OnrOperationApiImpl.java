package fi.oph.vkt.service.onr;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.config.Constants;
import fi.oph.vkt.util.HetuUtils;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import net.minidev.json.JSONArray;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.util.HttpConstants;
import org.asynchttpclient.util.HttpConstants.Methods;
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

  @Override
  public String insertPersonalData(final PersonalData personalData) throws Exception {
    final PersonalDataDTO personalDataDTO = createPersonalDataDTO(personalData);

    final Request request = defaultRequestBuilder()
      .setUrl(onrServiceUrl + "/henkilo")
      .setMethod(Methods.POST)
      .setBody(OBJECT_MAPPER.writeValueAsString(personalDataDTO))
      .build();

    final Response response = onrClient.executeBlocking(request);

    if (response.getStatusCode() == HttpStatus.CREATED.value()) {
      return response.getResponseBody();
    } else {
      throw new RuntimeException(
        "ONR service called with POST /henkilo returned unexpected status code: " + response.getStatusCode()
      );
    }
  }

  static PersonalDataDTO createPersonalDataDTO(final PersonalData personalData) {
    final PersonalDataDTO personalDataDTO = new PersonalDataDTO();
    personalDataDTO.setOnrId(personalData.getOnrId());
    personalDataDTO.setLastName(personalData.getLastName());
    personalDataDTO.setFirstName(personalData.getFirstName());
    personalDataDTO.setNickname(personalData.getNickname());

    if (HetuUtils.hetuIsValid(personalData.getSsn())) {
      personalDataDTO.setIdentityNumber(personalData.getSsn());
    }

    return personalDataDTO;
  }

  private PersonalData createPersonalData(final PersonalDataDTO personalDataDTO) {
    return PersonalData
      .builder()
      .onrId(personalDataDTO.getOnrId())
      .lastName(personalDataDTO.getLastName())
      .firstName(personalDataDTO.getFirstName())
      .nickname(personalDataDTO.getNickname())
      .ssn(personalDataDTO.getIdentityNumber())
      .build();
  }

  private RequestBuilder defaultRequestBuilder() {
    return new RequestBuilder()
      .addHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Caller-Id", Constants.CALLER_ID)
      .setRequestTimeout(Duration.ofMinutes(2));
  }
}
