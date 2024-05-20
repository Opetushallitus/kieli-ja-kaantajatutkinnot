package fi.oph.akr.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.akr.Factory;
import fi.oph.akr.onr.OnrOperationApiImpl;
import fi.oph.akr.onr.dto.ContactDetailsGroupDTO;
import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.dto.ContactDetailsGroupType;
import fi.oph.akr.onr.dto.PersonalDataDTO;
import fi.oph.akr.onr.model.PersonalData;
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
          assertThat(actual.getContactDetailsGroups())
            .usingRecursiveComparison()
            .ignoringCollectionOrder()
            .ignoringFields("contactDetailsSet")
            .isEqualTo(expected.getContactDetailsGroups());

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
      .address(
        List.of(
          Factory.createAddress(
            "testi katu",
            "90100",
            "Testikaupunki",
            "FI",
            ContactDetailsGroupSource.AKR,
            ContactDetailsGroupType.AKR_OSOITE
          ),
          Factory.createAddress(
            "foo",
            "1234",
            "bar",
            null,
            ContactDetailsGroupSource.OTR,
            ContactDetailsGroupType.OTR_OSOITE
          ),
          Factory.createAddress(
            "foo",
            "1234",
            "bar",
            null,
            ContactDetailsGroupSource.OTR,
            ContactDetailsGroupType.OTR_OSOITE
          )
        )
      )
      .identityNumber("111111-1111")
      .individualised(true)
      .hasIndividualisedAddress(false)
      .build();

    onrOperationApi.updatePersonalData(personalData);
  }

  private static void assertDetailsGroupsEquals(
    final List<ContactDetailsGroupDTO> actual,
    final List<ContactDetailsGroupDTO> expected
  ) {
    final ContactDetailsGroupDTO actualContactDetailsGroups = actual
      .stream()
      .filter(group ->
        group.getSource().equals(ContactDetailsGroupSource.AKR) &&
        group.getType().equals(ContactDetailsGroupType.AKR_OSOITE)
      )
      .findFirst()
      .orElse(null);
    final ContactDetailsGroupDTO expectedContactDetailsGroups = expected
      .stream()
      .filter(group ->
        group.getSource().equals(ContactDetailsGroupSource.AKR) &&
        group.getType().equals(ContactDetailsGroupType.AKR_OSOITE)
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
