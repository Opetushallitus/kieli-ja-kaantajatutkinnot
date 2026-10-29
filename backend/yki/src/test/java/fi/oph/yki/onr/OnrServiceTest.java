package fi.oph.yki.onr;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.api.dto.PublicRegistrationFormDTO;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

public class OnrServiceTest {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  private final CasClient casClient = mock(CasClient.class);

  private final OnrService onrService = new OnrService(casClient, new RequestBuilder(), "http://localhost");

  private static Response response(final HttpStatus status, final String body) {
    final Response response = mock(Response.class);
    when(response.getStatusCode()).thenReturn(status.value());
    when(response.getResponseBody()).thenReturn(body);

    return response;
  }

  private List<JsonNode> mockOnr(final Response... responses) throws Exception {
    final List<JsonNode> requestBodies = new ArrayList<>();
    final Iterator<Response> iterator = List.of(responses).iterator();
    when(casClient.executeBlocking(any()))
      .thenAnswer(invocation -> {
        final Request request = invocation.getArgument(0, Request.class);
        assertEquals("http://localhost/s2s/findOrCreateHenkiloPerustieto", request.getUrl());
        requestBodies.add(OBJECT_MAPPER.readTree(request.getStringData()));

        return iterator.next();
      });

    return requestBodies;
  }

  private static PublicRegistrationFormDTO.PublicRegistrationFormDTOBuilder form() {
    return PublicRegistrationFormDTO
      .builder()
      .firstName("Testi Matti")
      .lastName("Henkilö")
      .nationalities(List.of("246"))
      .certificateLang("fi")
      .examLang("fi")
      .birthdate("1990-01-01")
      .postOffice("Helsinki")
      .zip("00100")
      .streetAddress("Testikatu 1")
      .phoneNumber("+358401234567")
      .email("testi@example.com");
  }

  @Test
  public void testFindOrCreatePersonWithSsnSendsHetuAndTrustsFoundPerson() throws Exception {
    final List<JsonNode> requests = mockOnr(
      response(HttpStatus.OK, "{\"oidHenkilo\": \"1.1.1\", \"sukunimi\": \"Muu\"}")
    );

    final Optional<String> oid = onrService.findOrCreatePerson(form().ssn("010190-123a").build(), 1L);

    assertEquals(Optional.of("1.1.1"), oid);
    assertEquals(1, requests.size());
    assertEquals("010190-123A", requests.get(0).get("hetu").asText());
    assertFalse(requests.get(0).has("identifications"));
    assertFalse(requests.get(0).has("syntymaaika"));
  }

  @Test
  public void testFindOrCreatePersonSendsFormFields() throws Exception {
    final List<JsonNode> requests = mockOnr(response(HttpStatus.CREATED, "{\"oidHenkilo\": \"1.1.1\"}"));

    final Optional<String> oid = onrService.findOrCreatePerson(form().gender("").nativeLanguage("FI").build(), 1L);

    assertEquals(Optional.of("1.1.1"), oid);
    final JsonNode body = requests.get(0);
    assertEquals("Testi Matti", body.get("etunimet").asText());
    assertEquals("Testi", body.get("kutsumanimi").asText());
    assertEquals("Henkilö", body.get("sukunimi").asText());
    assertFalse(body.has("sukupuoli"));
    assertEquals("fi", body.get("asiointiKieli").get("kieliKoodi").asText());
    assertEquals("246", body.get("kansalaisuus").get(0).get("kansalaisuusKoodi").asText());
    assertEquals("fi", body.get("aidinkieli").get("kieliKoodi").asText());
    assertEquals("1990-01-01", body.get("syntymaaika").asText());
    assertFalse(body.has("hetu"));
  }

  @Test
  public void testFindOrCreatePersonUsesPreferredNameAsNickname() throws Exception {
    final List<JsonNode> requests = mockOnr(response(HttpStatus.CREATED, "{\"oidHenkilo\": \"1.1.1\"}"));

    onrService.findOrCreatePerson(form().preferredName("Matti").build(), 1L);

    assertEquals("Matti", requests.get(0).get("kutsumanimi").asText());
  }

  @Test
  public void testFindOrCreatePersonSearchesByEmailThenByNameAndBirthdate() throws Exception {
    final List<JsonNode> requests = mockOnr(
      response(HttpStatus.OK, "{\"oidHenkilo\": \"1.1.1\", \"syntymaaika\": \"1980-01-01\"}"),
      response(HttpStatus.OK, "{\"oidHenkilo\": \"2.2.2\", \"syntymaaika\": \"1990-01-01\"}")
    );

    final Optional<String> oid = onrService.findOrCreatePerson(form().build(), 1L);

    assertEquals(Optional.of("2.2.2"), oid);
    assertEquals(2, requests.size());
    assertEquals("oppijaToken", requests.get(0).get("identifications").get(0).get("idpEntityId").asText());
    assertEquals("testi@example.com", requests.get(0).get("identifications").get(0).get("identifier").asText());
    assertEquals("henkilö_testi_1990-01-01", requests.get(1).get("identifications").get(0).get("identifier").asText());
  }

  @Test
  public void testFindOrCreatePersonForcesCreationWithoutIdentifications() throws Exception {
    final List<JsonNode> requests = mockOnr(
      response(HttpStatus.OK, "{\"oidHenkilo\": \"1.1.1\", \"syntymaaika\": \"1980-01-01\"}"),
      response(HttpStatus.OK, "{\"oidHenkilo\": \"2.2.2\", \"syntymaaika\": \"1981-01-01\"}"),
      response(HttpStatus.CREATED, "{\"oidHenkilo\": \"3.3.3\"}")
    );

    final Optional<String> oid = onrService.findOrCreatePerson(form().build(), 1L);

    assertEquals(Optional.of("3.3.3"), oid);
    assertEquals(3, requests.size());
    assertFalse(requests.get(2).has("identifications"));
  }

  @Test
  public void testFindOrCreatePersonReturnsLastMismatchWhenAttemptsAreExhausted() throws Exception {
    mockOnr(
      response(HttpStatus.OK, "{\"oidHenkilo\": \"1.1.1\", \"syntymaaika\": \"1980-01-01\"}"),
      response(HttpStatus.OK, "{\"oidHenkilo\": \"2.2.2\", \"syntymaaika\": \"1981-01-01\"}"),
      response(HttpStatus.OK, "{\"oidHenkilo\": \"3.3.3\", \"syntymaaika\": \"1982-01-01\"}")
    );

    final Optional<String> oid = onrService.findOrCreatePerson(form().build(), 1L);

    assertEquals(Optional.of("3.3.3"), oid);
  }

  @Test
  public void testFindOrCreatePersonStopsOnErrorStatus() throws Exception {
    final List<JsonNode> requests = mockOnr(response(HttpStatus.INTERNAL_SERVER_ERROR, ""));

    final Optional<String> oid = onrService.findOrCreatePerson(form().build(), 1L);

    assertEquals(Optional.empty(), oid);
    assertEquals(1, requests.size());
  }
}
