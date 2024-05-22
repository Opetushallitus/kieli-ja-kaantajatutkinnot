package fi.oph.akr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.akr.Factory;
import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.ContactDetailsUtil;
import fi.oph.akr.onr.OnrOperationApi;
import fi.oph.akr.onr.OnrOperationApiImpl;
import fi.oph.akr.onr.dto.ContactDetailsDTO;
import fi.oph.akr.onr.dto.ContactDetailsGroupDTO;
import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.dto.ContactDetailsGroupType;
import fi.oph.akr.onr.dto.ContactDetailsType;
import fi.oph.akr.onr.model.PersonalData;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.io.IOException;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import org.asynchttpclient.Request;
import org.asynchttpclient.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class OnrContactDetailsTest {

  private OnrOperationApi onrOperationApi;

  @Value("classpath:json/onr-person-1.json")
  private org.springframework.core.io.Resource onrMockResponse1;

  @Value("classpath:json/onr-person-2.json")
  private org.springframework.core.io.Resource onrMockResponse2;

  @BeforeEach
  public void setup() throws ExecutionException, InterruptedException, IOException {
    final CasClient casClient = mock(CasClient.class);
    when(casClient.executeBlocking(any()))
      .thenAnswer(invocation -> {
        final Request request = invocation.getArgument(0, Request.class);
        final Response response = mock(Response.class);
        final String mockJson =
          switch (request.getUrl()) {
            case "http://localhost/henkilo/hetu=111111-1111" -> new String(
              onrMockResponse1.getInputStream().readAllBytes()
            );
            case "http://localhost/henkilo/hetu=222222-2222" -> new String(
              onrMockResponse2.getInputStream().readAllBytes()
            );
            default -> "";
          };

        when(response.getStatusCode()).thenReturn(HttpStatus.OK.value());
        when(response.getResponseBody()).thenReturn(mockJson);

        return response;
      });
    onrOperationApi = new OnrOperationApiImpl(casClient, "http://localhost");
  }

  @Test
  public void shouldCreateAkrContactDetailsGroupWithAddress() {
    final PersonalData personalData = PersonalData
      .builder()
      .onrId("1.2.3.4")
      .lastName("Suku")
      .email("foo@bar")
      .phoneNumber("1234")
      .firstName("Etu")
      .nickName("Etu")
      .address(Factory.createAddressList("st", "pstl", "tw", "FI"))
      .identityNumber("112233")
      .individualised(true)
      .hasIndividualisedAddress(false)
      .build();

    final ContactDetailsGroupDTO contactDetailsGroupDTO = ContactDetailsUtil.createAkrContactDetailsGroup(personalData);
    final Set<ContactDetailsDTO> contactDetailsDTO = contactDetailsGroupDTO.getContactDetailsSet();

    assertEquals(ContactDetailsGroupType.AKR_OSOITE, contactDetailsGroupDTO.getType());
    assertEquals(ContactDetailsGroupSource.AKR, contactDetailsGroupDTO.getSource());
    assertEquals(6, contactDetailsDTO.size());
    assertEquals("foo@bar", findValue(contactDetailsDTO, ContactDetailsType.EMAIL));
    assertEquals("1234", findValue(contactDetailsDTO, ContactDetailsType.PHONE_NUMBER));
    assertEquals("st", findValue(contactDetailsDTO, ContactDetailsType.STREET));
    assertEquals("tw", findValue(contactDetailsDTO, ContactDetailsType.TOWN));
    assertEquals("pstl", findValue(contactDetailsDTO, ContactDetailsType.POSTAL_CODE));
    assertEquals("FI", findValue(contactDetailsDTO, ContactDetailsType.COUNTRY));
  }

  @Test
  public void shouldCreateAkrContactDetailsGroupWithEmptyAddress() {
    final PersonalData personalData = PersonalData
      .builder()
      .onrId("1.2.3.4")
      .lastName("Suku")
      .firstName("Etu")
      .nickName("Etu")
      .address(Collections.emptyList())
      .identityNumber("112233")
      .individualised(true)
      .hasIndividualisedAddress(false)
      .build();

    final ContactDetailsGroupDTO contactDetailsGroupDTO = ContactDetailsUtil.createAkrContactDetailsGroup(personalData);

    assertEquals(ContactDetailsGroupType.AKR_OSOITE, contactDetailsGroupDTO.getType());
    assertEquals(ContactDetailsGroupSource.AKR, contactDetailsGroupDTO.getSource());
    assertEquals(6, contactDetailsGroupDTO.getContactDetailsSet().size());
  }

  @Test
  public void fetchShouldPickCorrectCorrectContactDetails() throws Exception {
    final PersonalData personalData = onrOperationApi.findPersonalDataByIdentityNumber("111111-1111").orElseThrow();
    final Translator translator = Factory.translator();
    translator.setSelectedType(ContactDetailsGroupType.AKR_OSOITE.toString());
    translator.setSelectedSource(ContactDetailsGroupSource.AKR.toString());

    assertEquals("ESP", ContactDetailsUtil.getPrimaryAddress(personalData, translator).country());
  }

  @Test
  public void fetchShouldPickCorrectCorrectContactDetails2() throws Exception {
    final PersonalData personalData = onrOperationApi.findPersonalDataByIdentityNumber("222222-2222").orElseThrow();
    final Translator translator = Factory.translator();
    translator.setSelectedType(ContactDetailsGroupType.VAKINAINEN_KOTIMAAN_OSOITE.toString());
    translator.setSelectedSource(ContactDetailsGroupSource.VTJ.toString());

    assertEquals("Suomi", ContactDetailsUtil.getPrimaryAddress(personalData, translator).country());
  }

  private String findValue(final Set<ContactDetailsDTO> expectContactDetailsDTO, final ContactDetailsType type) {
    return expectContactDetailsDTO
      .stream()
      .filter(e -> e.getType() == type)
      .findFirst()
      .map(ContactDetailsDTO::getValue)
      .orElse(null);
  }
}
