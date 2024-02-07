package fi.oph.akr.service;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.akr.onr.OnrOperationApi;
import fi.oph.akr.onr.OnrOperationApiImpl;
import fi.oph.akr.onr.model.PersonalData;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.io.IOException;
import java.util.concurrent.ExecutionException;
import org.asynchttpclient.Request;
import org.asynchttpclient.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@SpringBootTest
public class OnrContactDetailsTest {

  private OnrOperationApi onrOperationApi;

  @Value("classpath:json/onr-person-1.json")
  private org.springframework.core.io.Resource onrMockRequest1;

  @Value("classpath:json/onr-person-2.json")
  private org.springframework.core.io.Resource onrMockRequest2;

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
              onrMockRequest1.getInputStream().readAllBytes()
            );
            case "http://localhost/henkilo/hetu=222222-2222" -> new String(
              onrMockRequest2.getInputStream().readAllBytes()
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
  public void fetchShouldPickCorrectCorrectContactDetails() throws Exception {
    final PersonalData personalData = onrOperationApi.findPersonalDataByIdentityNumber("111111-1111").orElseThrow();

    assertEquals("Espanja", personalData.getCountry());
  }

  @Test
  public void fetchShouldPickCorrectCorrectContactDetails2() throws Exception {
    final PersonalData personalData = onrOperationApi.findPersonalDataByIdentityNumber("222222-2222").orElseThrow();

    assertEquals("Espanja", personalData.getCountry());
  }
}
