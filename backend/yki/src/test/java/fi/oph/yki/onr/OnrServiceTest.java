package fi.oph.yki.onr;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.yki.config.Constants;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
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
}
