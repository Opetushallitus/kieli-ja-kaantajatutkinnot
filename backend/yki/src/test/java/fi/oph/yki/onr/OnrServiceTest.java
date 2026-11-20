package fi.oph.yki.onr;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.yki.config.Constants;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.asynchttpclient.Request;
import org.asynchttpclient.Response;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

public class OnrServiceTest {

  private final CasClient casClient = mock(CasClient.class);

  private final OnrService onrService = new OnrService(casClient, "http://localhost");

  private static Response response(final HttpStatus status, final String body) {
    final Response response = mock(Response.class);
    when(response.getStatusCode()).thenReturn(status.value());
    when(response.getResponseBody()).thenReturn(body);

    return response;
  }

  @Test
  public void testRequestDoesNotCarryEarlierRequestBody() throws Exception {
    final Iterator<Response> responses = List
      .of(response(HttpStatus.OK, "[]"), response(HttpStatus.OK, "{\"oidHenkilo\": \"1.1.1\"}"))
      .iterator();
    final List<Request> requests = new ArrayList<>();
    when(casClient.executeBlocking(any()))
      .thenAnswer(invocation -> {
        requests.add(invocation.getArgument(0, Request.class));

        return responses.next();
      });

    onrService.listPersonDetails(List.of("1.1.1"));
    onrService.getPersonalData("1.1.1");

    final Request request = requests.get(1);
    assertEquals("http://localhost/henkilo/1.1.1", request.getUrl());
    assertNull(request.getStringData());
    assertEquals(MediaType.APPLICATION_JSON_VALUE, request.getHeaders().get("Accept"));
    assertEquals(MediaType.APPLICATION_JSON_VALUE, request.getHeaders().get("Content-Type"));
    assertEquals(Constants.CALLER_ID, request.getHeaders().get("Caller-Id"));
  }

  @Test
  public void testListMasterPersonsByOids() throws Exception {
    final Response response = response(
      HttpStatus.OK,
      """
      {
        "1.2.3.4.5": {
          "oidHenkilo": "1.2.3.4.9",
          "oppijanumero": "1.2.3.4.9",
          "yksiloity": false,
          "yksiloityVTJ": true,
          "etunimet": "Testi"
        }
      }
      """
    );
    final List<Request> requests = new ArrayList<>();
    when(casClient.executeBlocking(any()))
      .thenAnswer(invocation -> {
        requests.add(invocation.getArgument(0, Request.class));

        return response;
      });

    final Map<String, PersonalDataDTO> persons = onrService.listMasterPersonsByOids(List.of("1.2.3.4.5"));

    final Request request = requests.get(0);
    assertEquals("http://localhost/henkilo/masterHenkilosByOidList", request.getUrl());
    assertEquals("POST", request.getMethod());
    assertEquals("[\"1.2.3.4.5\"]", request.getStringData());

    assertEquals(1, persons.size());
    final PersonalDataDTO person = persons.get("1.2.3.4.5");
    assertEquals("1.2.3.4.9", person.getOidHenkilo());
    assertEquals("1.2.3.4.9", person.getOppijanumero());
    assertEquals(false, person.getIndividualised());
    assertEquals(true, person.getIndividualisedVtj());
  }

  @Test
  public void testListMasterPersonsByOidsThrowsOnErrorStatus() throws Exception {
    final Response response = response(HttpStatus.INTERNAL_SERVER_ERROR, "");
    when(casClient.executeBlocking(any())).thenReturn(response);

    assertThrows(RuntimeException.class, () -> onrService.listMasterPersonsByOids(List.of("1.2.3.4.5")));
  }
}
