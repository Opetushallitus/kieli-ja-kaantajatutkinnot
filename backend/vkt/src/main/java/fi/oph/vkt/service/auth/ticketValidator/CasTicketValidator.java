package fi.oph.vkt.service.auth.ticketValidator;

import com.ctc.wstx.stax.WstxInputFactory;
import com.ctc.wstx.stax.WstxOutputFactory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.dataformat.xml.XmlFactory;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class CasTicketValidator implements TicketValidator {

  private static final Logger LOG = LoggerFactory.getLogger(CasTicketValidator.class);

  private static final XmlFactory XF = XmlFactory
    .builder()
    .xmlInputFactory(new WstxInputFactory())
    .xmlOutputFactory(new WstxOutputFactory())
    .build();
  private static final XmlMapper XML_MAPPER = new XmlMapper(XF);
  private static final int REQUEST_ATTEMPTS = 3;

  private final Environment environment;
  private final WebClient webClient;

  @Override
  public Map<String, String> validateTicket(final String ticket, final long examEventId, final EnrollmentType type) {
    final String response = requestWithRetries(ticket, examEventId, type, REQUEST_ATTEMPTS);

    final CasResponse casResponse = parseCasResponse(response);

    if (casResponse.getAuthenticationSuccess().getUser().isEmpty()) {
      throw new APIException(APIExceptionType.INVALID_TICKET);
    }

    final CasAttributes casAttributes = casResponse.getAuthenticationSuccess().getAttributes();

    final Map<String, String> personDetails = new HashMap<>();
    final String sn = casAttributes.getSn();

    personDetails.put("lastName", sn == null || sn.isEmpty() ? casAttributes.getFamilyName() : sn);
    personDetails.put("firstName", casAttributes.getFirstName());
    personDetails.put("oid", casAttributes.getPersonOid());
    personDetails.put("otherIdentifier", casAttributes.getPersonIdentifier());
    personDetails.put("nationalIdentificationNumber", casAttributes.getNationalIdentificationNumber());

    return personDetails;
  }

  private String requestWithRetries(
    final String ticket,
    final long examEventId,
    final EnrollmentType type,
    final int attemptsRemaining
  ) {
    try {
      return webClient
        .get()
        .uri(uriBuilder ->
          uriBuilder
            .queryParam(
              "service",
              String.format(environment.getRequiredProperty("app.cas-oppija.service-url"), examEventId, type)
            )
            .queryParam("ticket", ticket)
            .build()
        )
        .exchangeToMono(clientResponse -> {
          if (clientResponse.statusCode().isError()) {
            return clientResponse.createException().flatMap(Mono::error);
          }
          return clientResponse.bodyToMono(String.class);
        })
        .block();
    } catch (final WebClientResponseException e) {
      LOG.error(
        "CAS returned error status {}\n response body: {}\n request url: {}\n",
        e.getStatusCode().value(),
        e.getResponseBodyAsString(),
        e.getRequest() != null ? e.getRequest().getURI() : ""
      );
      throw new APIException(APIExceptionType.TICKET_VALIDATION_ERROR);
    } catch (final Exception e) {
      final int retries = attemptsRemaining - 1;
      LOG.error("CAS request failed! Retries remaining: {}", retries, e);
      if (retries > 0) {
        return requestWithRetries(ticket, examEventId, type, retries);
      } else {
        throw e;
      }
    }
  }

  private CasResponse parseCasResponse(final String result) {
    try {
      return XML_MAPPER.readValue(result, new TypeReference<>() {});
    } catch (final Exception e) {
      LOG.error("Exception when parsing cas response: " + result, e);
      throw new APIException(APIExceptionType.TICKET_VALIDATION_ERROR);
    }
  }
}
