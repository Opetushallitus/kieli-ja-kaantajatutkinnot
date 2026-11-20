package fi.oph.vkt.service.email.sender;

import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.service.email.EmailData;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import org.asynchttpclient.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class EmailSenderViestintapalveluNewTest {

  private EmailSenderViestintapalveluNew sender;

  private CasClient casClient;

  @BeforeEach
  public void setup() {
    casClient = mock(CasClient.class);
    sender = new EmailSenderViestintapalveluNew(casClient, "http://localhost/");
  }

  @Test
  public void test() throws JsonProcessingException, InterruptedException, ExecutionException {
    final Response response = mock(Response.class);
    when(response.getStatusCode()).thenReturn(200);
    when(response.getResponseBody()).thenReturn("{\"lahetysTunniste\": \"12345\"}");
    when(
      casClient.executeAndRetryWithCleanSessionOnStatusCodes(
        argThat(r -> {
          final ObjectMapper mapper = new ObjectMapper();
          assertNotNull(r);
          assertEquals("http://localhost//lahetys/v1/viestit", r.getUrl());
          assertEquals("POST", r.getMethod());
          assertEquals("1.2.246.562.10.00000000001.vkt", r.getHeaders().get("Caller-Id"));
          assertEquals("application/json", r.getHeaders().get("Content-Type"));
          assertEquals("application/json", r.getHeaders().get("Accept"));

          try {
            assertEquals(
              mapper.readTree(
                "{\"vastaanottajat\":[{\"sahkopostiOsoite\":\"vastaanottaja@invalid\",\"nimi\":\"vastaanottaja\"}],\"idempotencyKey\":\"vkt-1\",\"liitteidenTunnisteet\":[],\"lahettavaPalvelu\":\"vkt\",\"lahettaja\":{\"sahkopostiOsoite\":\"noreply@opintopolku.fi\",\"nimi\":\"Valtionhallinnon kielitutkinnot - Opetushallitus\"},\"sisalto\":\"testiviesti\",\"sailytysaika\":180,\"sisallonTyyppi\":\"html\",\"otsikko\":\"testiotsikko\",\"prioriteetti\":\"normaali\"}"
              ),
              mapper.readTree(r.getStringData())
            );
          } catch (final JsonProcessingException e) {
            return false;
          }

          return true;
        }),
        anySet()
      )
    )
      .thenReturn(CompletableFuture.completedFuture(response));

    final EmailData emailData = EmailData
      .builder()
      .id(1L)
      .recipientName("vastaanottaja")
      .recipientAddress("vastaanottaja@invalid")
      .subject("testiotsikko")
      .body("testiviesti")
      .attachments(List.of())
      .build();

    final String extId = sender.sendEmail(emailData);

    assertEquals("12345", extId);
  }

  @Test
  public void testFailure() {
    final Response response = mock(Response.class);
    when(response.getStatusCode()).thenReturn(500);
    when(casClient.executeAndRetryWithCleanSessionOnStatusCodes(any(), anySet()))
      .thenReturn(CompletableFuture.completedFuture(response));

    final EmailData emailData = EmailData
      .builder()
      .id(1L)
      .recipientName("vastaanottaja")
      .recipientAddress("vastaanottaja@invalid")
      .subject("testiotsikko")
      .body("testiviesti")
      .attachments(List.of())
      .build();

    assertThrows(Exception.class, () -> sender.sendEmail(emailData));
  }
}
