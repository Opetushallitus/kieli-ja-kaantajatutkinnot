package fi.oph.otr.onr;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.otr.onr.model.PersonalData;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.io.IOException;
import java.util.Optional;
import org.asynchttpclient.Response;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class OnrRequestTest {

  @Value("classpath:json/henkilo-hetu-response.json")
  private org.springframework.core.io.Resource hetuRequestResponse;

  @Test
  void testFindPersonByIdentityNumberDeserializes() throws Exception {
    final Response response = mock(Response.class);
    final CasClient casClient = mock(CasClient.class);
    final OnrOperationApiImpl onrOperationApi = new OnrOperationApiImpl(casClient, "http://localhost");

    when(casClient.executeBlocking(any())).thenReturn(response);
    when(response.getStatusCode()).thenReturn(200);
    when(response.getResponseBody()).thenReturn(getHetuMockJsonResponse());

    final Optional<PersonalData> personalDataOptional = onrOperationApi.findPersonalDataByIdentityNumber("54321-54312");

    assertTrue(personalDataOptional.isPresent());
  }

  private String getHetuMockJsonResponse() throws IOException {
    return new String(hetuRequestResponse.getInputStream().readAllBytes());
  }
}
