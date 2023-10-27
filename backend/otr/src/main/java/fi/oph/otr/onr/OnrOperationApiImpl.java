package fi.oph.otr.onr;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
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
import net.minidev.json.JSONArray;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.util.HttpConstants.Methods;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

public class OnrOperationApiImpl implements OnrOperationApi {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

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
   * Creates PersonalData based on `personalDataDTO` fetched from ONR. ONR data is expected to contain
   * `onrId`, `isIndividualised` information and `identityNumber` for any retrieved data.
   */
  private PersonalData createPersonalData(final PersonalDataDTO personalDataDTO) {
    assert personalDataDTO.getOnrId() != null;
    assert personalDataDTO.getIndividualised() != null;

    final List<ContactDetailsGroupDTO> groups = personalDataDTO.getContactDetailsGroups();
    final boolean hasIndividualisedAddress = ContactDetailsUtil.containsCivilRegistryAddressField(groups);

    // If person in ONR is marked passive, it's lacking an identity number.
    // The passive person might however be linked to another "master" person which does have identity number. In this
    // case, the passive person is also a duplicate.
    final Optional<String> identityNumber = Optional.ofNullable(personalDataDTO.getIdentityNumber());

    return PersonalData
      .builder()
      .onrId(personalDataDTO.getOnrId())
      .individualised(personalDataDTO.getIndividualised())
      .hasIndividualisedAddress(hasIndividualisedAddress)
      .lastName(personalDataDTO.getLastName())
      .firstName(personalDataDTO.getFirstName())
      .nickName(personalDataDTO.getNickName())
      .identityNumber(identityNumber.orElse("ei tiedossa"))
      .email(ContactDetailsUtil.getPrimaryEmail(groups))
      .phoneNumber(ContactDetailsUtil.getPrimaryPhoneNumber(groups))
      .street(ContactDetailsUtil.getPrimaryStreet(groups))
      .postalCode(ContactDetailsUtil.getPrimaryPostalCode(groups))
      .town(ContactDetailsUtil.getPrimaryTown(groups))
      .country(ContactDetailsUtil.getPrimaryCountry(groups))
      .build();
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
      throw new RuntimeException("ONR service returned unexpected status code: " + response.getStatusCode());
    }
  }

  private PersonalDataDTO getPersonalData(final String oidNumber) throws Exception {
    final Request request = defaultRequestBuilder()
      .setUrl(onrServiceUrl + "/henkilo/" + oidNumber)
      .setMethod(Methods.GET)
      .build();

    final Response response = onrClient.executeBlocking(request);

    if (response.getStatusCode() == HttpStatus.OK.value()) {
      final PersonalDataDTO personalDataDTO = OBJECT_MAPPER.readValue(
        response.getResponseBody(),
        new TypeReference<>() {}
      );
      return personalDataDTO;
    } else {
      throw new RuntimeException("ONR service returned unexpected status code: " + response.getStatusCode());
    }
  }

  @Override
  public void updatePersonalData(final PersonalData personalData) throws Exception {
    final PersonalDataDTO personalDataDTO = createPersonalDataDTO(personalData);

    final List<ContactDetailsGroupDTO> latestContactDetails = getPersonalData(personalData.getOnrId())
      .getContactDetailsGroups();
    final PersonalDataDTO combinedContactDetailsPersonalDataDTO = ContactDetailsUtil.combineContactDetails(
      personalDataDTO,
      latestContactDetails
    );

    final Request request = defaultRequestBuilder()
      .setUrl(onrServiceUrl + "/henkilo")
      .setMethod(Methods.PUT)
      .setBody(OBJECT_MAPPER.writeValueAsString(combinedContactDetailsPersonalDataDTO))
      .build();

    final Response response = onrClient.executeBlocking(request);

    if (response.getStatusCode() != HttpStatus.OK.value()) {
      throw new RuntimeException("ONR service returned unexpected status code: " + response.getStatusCode());
    }
  }

  static PersonalDataDTO createPersonalDataDTO(final PersonalData personalData) {
    assert personalData.getIndividualised() != null;
    assert personalData.getHasIndividualisedAddress() != null;

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
