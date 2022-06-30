package fi.oph.otr.onr;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.otr.config.Constants;
import fi.oph.otr.onr.dto.ContactDetailsGroupDTO;
import fi.oph.otr.onr.dto.PersonalDataDTO;
import fi.oph.otr.onr.model.PersonalData;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import net.minidev.json.JSONArray;
import org.apache.commons.lang.NotImplementedException;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.util.HttpConstants.Methods;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

@RequiredArgsConstructor
public class OnrOperationApiImpl implements OnrOperationApi {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  private final CasClient onrClient;

  private final String onrServiceUrl;

  @Override
  public Map<String, PersonalData> fetchPersonalDatas(final List<String> onrIds) throws Exception {
    final Request request = defaultRequestBuilder()
      .setUrl(onrServiceUrl + "/henkilo/henkilotByHenkiloOidList")
      .setMethod(Methods.POST)
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
      throw new RuntimeException("ONR service returned unexpected status code: " + response.getStatusCode());
    }
  }

  @Override
  public Optional<PersonalData> findPersonalDataByIdentityNumber(final String identityNumber) throws Exception {
    final Request request = defaultRequestBuilder()
      .setUrl(onrServiceUrl + "/henkilo/hetu=" + identityNumber)
      .setMethod(Methods.GET)
      .build();

    final Response response = onrClient.executeBlocking(request);

    if (response.getStatusCode() == HttpStatus.OK.value()) {
      final PersonalDataDTO personalDataDTO = OBJECT_MAPPER.readValue(
        response.getResponseBody(),
        new TypeReference<>() {}
      );

      return Optional.of(createPersonalData(personalDataDTO));
    } else if (response.getStatusCode() == HttpStatus.NOT_FOUND.value()) {
      return Optional.empty();
    } else {
      throw new RuntimeException("ONR service returned unexpected status code: " + response.getStatusCode());
    }
  }

  /**
   * Creates PersonalData based on `personalDataDTO`.
   * If `personalDataDTO` has null identityNumber, or its `contactDetailsGroups` contains no suitable group with
   * email contact details, building PersonalData will fail to @NonNull constraint. This shouldn't take place in
   * production but may occur with improper ONR test data.
   */
  private PersonalData createPersonalData(final PersonalDataDTO personalDataDTO) {
    final List<ContactDetailsGroupDTO> groups = personalDataDTO.getContactDetailsGroups();

    return PersonalData
      .builder()
      .onrId(personalDataDTO.getOnrId())
      .individualised(personalDataDTO.getIndividualised())
      .lastName(personalDataDTO.getLastName())
      .firstName(personalDataDTO.getFirstName())
      .nickName(personalDataDTO.getNickName())
      .identityNumber(personalDataDTO.getIdentityNumber())
      .email(ContactDetailsUtil.getPrimaryEmail(groups))
      .phoneNumber(ContactDetailsUtil.getPrimaryPhoneNumber(groups))
      .street(ContactDetailsUtil.getPrimaryStreet(groups))
      .postalCode(ContactDetailsUtil.getPrimaryPostalCode(groups))
      .town(ContactDetailsUtil.getPrimaryTown(groups))
      .country(ContactDetailsUtil.getPrimaryCountry(groups))
      .build();
  }

  // TODO: insert personal data in ONR
  @Override
  public String insertPersonalData(final PersonalData personalData) {
    throw new NotImplementedException();
  }

  @Override
  public void updatePersonalData(final PersonalData personalData) throws Exception {
    final PersonalDataDTO personalDataDTO = createPersonalDataDTO(personalData);

    final Request request = defaultRequestBuilder()
      .setUrl(onrServiceUrl + "/henkilo")
      .setMethod(Methods.PUT)
      .setBody(OBJECT_MAPPER.writeValueAsString(personalDataDTO))
      .build();

    final Response response = onrClient.executeBlocking(request);

    if (response.getStatusCode() != HttpStatus.OK.value()) {
      throw new RuntimeException("ONR service returned unexpected status code: " + response.getStatusCode());
    }
  }

  static PersonalDataDTO createPersonalDataDTO(final PersonalData personalData) {
    final List<ContactDetailsGroupDTO> contactDetailsGroups = List.of(
      ContactDetailsUtil.createOtrContactDetailsGroup(personalData)
    );
    final PersonalDataDTO personalDataDTO = new PersonalDataDTO();
    personalDataDTO.setOnrId(personalData.getOnrId());
    personalDataDTO.setLastName(personalData.getLastName());
    personalDataDTO.setFirstName(personalData.getFirstName());
    personalDataDTO.setNickName(personalData.getNickName());
    personalDataDTO.setIdentityNumber(personalData.getIdentityNumber());
    personalDataDTO.setIndividualised(personalData.getIndividualised());
    personalDataDTO.setContactDetailsGroups(contactDetailsGroups);
    return personalDataDTO;
  }

  private RequestBuilder defaultRequestBuilder() {
    return new RequestBuilder()
      .addHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Caller-Id", Constants.CALLER_ID)
      .setRequestTimeout((int) TimeUnit.MINUTES.toMillis(2));
  }
}
