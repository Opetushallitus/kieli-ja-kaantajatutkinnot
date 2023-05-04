package fi.oph.vkt.service.auth.ticketValidator;

import com.ctc.wstx.stax.WstxInputFactory;
import com.ctc.wstx.stax.WstxOutputFactory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.dataformat.xml.XmlFactory;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.reactive.function.client.WebClient;
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

  private final Environment environment;
  private final WebClient webClient;

  @Override
  public Map<String, String> validateTicket(final String ticket) {
    final Mono<String> response = webClient
      .get()
      .uri(uriBuilder ->
        uriBuilder
          .queryParam("service", environment.getRequiredProperty("app.cas-oppija.service-url"))
          .queryParam("ticket", ticket)
          .build()
      )
      .retrieve()
      .bodyToMono(String.class);

    final String result = response.block();

    final CasResponse casResponse = parseCasResponse(result);

    if (casResponse.getAuthenticationSuccess().getUser().isEmpty()) {
      throw new APIException(APIExceptionType.INVALID_TICKET);
    }

    final CasAttributes casAttributes = casResponse.getAuthenticationSuccess().getAttributes();

    final String sn = casAttributes.getSn();
    final Map<String, String> personDetails = new HashMap<>();
    personDetails.put("identityNumber", casAttributes.getNationalIdentificationNumber());
    personDetails.put("otherIdentifier", casAttributes.getPersonIdentifier());
    personDetails.put("dateOfBirth", casAttributes.getDateOfBirth());
    personDetails.put("oid", casAttributes.getPersonOid());
    personDetails.put("firstName", casAttributes.getFirstName());
    personDetails.put("lastName", sn == null || sn.isEmpty() ? casAttributes.getFamilyName() : sn);

    return personDetails;
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
