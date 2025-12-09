package fi.oph.otr.onr;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.otr.Factory;
import fi.oph.otr.onr.dto.ContactDetailsGroupDTO;
import fi.oph.otr.onr.dto.ContactDetailsGroupSource;
import fi.oph.otr.onr.dto.ContactDetailsGroupType;
import fi.oph.otr.onr.dto.PersonalDataDTO;
import fi.oph.otr.onr.model.PersonalData;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.asynchttpclient.Request;
import org.asynchttpclient.Response;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class OnrOperationApiTest {

  @Value("classpath:json/onr-person-3.json")
  private org.springframework.core.io.Resource onrMockResponse;

  @Value("classpath:json/onr-person-list.json")
  private org.springframework.core.io.Resource onrMockListResponse;

  @Value("classpath:json/onr-request-payload.json")
  private org.springframework.core.io.Resource onrMockRequest;

  @Test
  public void shouldUpdateAkrContactDetailsGroup() throws Exception {
    final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    final CasClient casClient = mock(CasClient.class);
    when(casClient.executeBlocking(any()))
      .thenAnswer(invocation -> {
        final Request request = invocation.getArgument(0, Request.class);
        final Response response = mock(Response.class);
        final String mockJson =
          switch (request.getUrl()) {
            case "http://localhost/henkilo" -> "1.2.3.4";
            case "http://localhost/henkilo/1.2.3.4" -> new String(onrMockResponse.getInputStream().readAllBytes());
            default -> "";
          };

        if (request.getUrl().equals("http://localhost/henkilo")) {
          final PersonalDataDTO expected = OBJECT_MAPPER.readValue(
            onrMockRequest.getInputStream().readAllBytes(),
            new TypeReference<>() {}
          );
          final PersonalDataDTO actual = OBJECT_MAPPER.readValue(request.getStringData(), new TypeReference<>() {});

          assertThat(actual).usingRecursiveComparison().ignoringFields("contactDetailsGroups").isEqualTo(expected);
          assertDetailsGroupsEquals(actual.getContactDetailsGroups(), expected.getContactDetailsGroups());
        }

        when(response.getStatusCode()).thenReturn(HttpStatus.OK.value());
        when(response.getResponseBody()).thenReturn(mockJson);

        return response;
      });

    final OnrOperationApiImpl onrOperationApi = new OnrOperationApiImpl(casClient, "http://localhost");
    final PersonalData personalData = PersonalData
      .builder()
      .onrId("1.2.3.4")
      .email("foo@bar")
      .phoneNumber("01234")
      .lastName("Suku")
      .firstName("Etu")
      .nickName("Etu")
      .isPassive(false)
      .isDuplicate(false)
      .street("testi katu")
      .postalCode("90100")
      .town("Testikaupunki")
      .country("FI")
      .identityNumber("111111-1111")
      .individualised(true)
      .hasIndividualisedAddress(false)
      .build();

    onrOperationApi.updatePersonalData(personalData);
  }

  @Test
  public void shouldFetchOnrPersonalData() throws Exception {
    final CasClient casClient = mock(CasClient.class);
    final OnrOperationApiImpl onrOperationApi = new OnrOperationApiImpl(casClient, "http://localhost");
    when(casClient.executeBlocking(any()))
      .thenAnswer(invocation -> {
        final Request request = invocation.getArgument(0, Request.class);
        final Response response = mock(Response.class);
        final String mockJson = request.getUrl().equals("http://localhost/henkilo/henkilotByHenkiloOidList")
          ? new String(onrMockListResponse.getInputStream().readAllBytes())
          : "";
        when(response.getStatusCode()).thenReturn(HttpStatus.OK.value());
        when(response.getResponseBody()).thenReturn(mockJson);

        return response;
      });

    final Map<String, PersonalData> personalDatas = onrOperationApi.fetchPersonalDatas(
      List.of("1.2.246.562.24.17957554663")
    );

    assertTrue(personalDatas.get("1.2.246.562.24.17957554663").isDeceased());
  }

  private static void assertDetailsGroupsEquals(
    final List<ContactDetailsGroupDTO> actual,
    final List<ContactDetailsGroupDTO> expected
  ) {
    final ContactDetailsGroupDTO actualContactDetailsGroups = actual
      .stream()
      .filter(group ->
        group.getSource().equals(ContactDetailsGroupSource.OTR) &&
        group.getType().equals(ContactDetailsGroupType.OTR_OSOITE)
      )
      .findFirst()
      .orElse(null);
    final ContactDetailsGroupDTO expectedContactDetailsGroups = expected
      .stream()
      .filter(group ->
        group.getSource().equals(ContactDetailsGroupSource.OTR) &&
        group.getType().equals(ContactDetailsGroupType.OTR_OSOITE)
      )
      .findFirst()
      .orElse(null);

    assert actualContactDetailsGroups != null;
    assert expectedContactDetailsGroups != null;
    final Map<String, String> actualDetailsSet = collectDetailsSetToMap(actualContactDetailsGroups);
    final Map<String, String> expectedDetailsSet = collectDetailsSetToMap(expectedContactDetailsGroups);

    assertThat(actualDetailsSet).usingRecursiveComparison().ignoringCollectionOrder().isEqualTo(expectedDetailsSet);
  }

  private static Map<String, String> collectDetailsSetToMap(final ContactDetailsGroupDTO contactDetailsGroupDTO) {
    return contactDetailsGroupDTO
      .getContactDetailsSet()
      .stream()
      .collect(Collectors.toMap(k -> k.getType().toString(), v -> v.getValue() == null ? "" : v.getValue()));
  }
}
