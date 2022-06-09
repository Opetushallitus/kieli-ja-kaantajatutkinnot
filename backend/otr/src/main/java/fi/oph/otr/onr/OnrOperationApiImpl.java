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
    final Request request = new RequestBuilder()
      .setUrl(onrServiceUrl + "/henkilo/henkilotByHenkiloOidList")
      .setMethod(Methods.POST)
      .setBody(JSONArray.toJSONString(onrIds))
      .addHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Caller-Id", Constants.CALLER_ID)
      .setRequestTimeout((int) TimeUnit.MINUTES.toMillis(2))
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
      .isIndividualised(personalDataDTO.getIsIndividualised())
      .build();
  }

  // TODO: insert personal data in ONR
  @Override
  public String insertPersonalData(final PersonalData personalData) {
    throw new NotImplementedException();
  }

  // TODO: update existing personal data in ONR
  @Override
  public void updatePersonalData(final String onrId, final PersonalData personalData) {
    throw new NotImplementedException();
  }
}
