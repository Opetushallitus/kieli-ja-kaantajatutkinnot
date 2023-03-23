package fi.oph.vkt.service.auth.ticketValidator;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import fi.oph.vkt.audit.LoggerImpl;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.Map;

@RequiredArgsConstructor
public class CasTicketValidator implements TicketValidator {

  private static final XmlMapper XML_MAPPER = new XmlMapper();

  private static final Logger LOG = LoggerFactory.getLogger(LoggerImpl.class);

  private final WebClient webClient;

  final String casExampleResponse = """
        <cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
            <cas:authenticationSuccess>
              <cas:user>suomi.fi,010280-952L</cas:user>
              <cas:attributes>
                <cas:firstName>Tessa</cas:firstName>
                <cas:clientName>suomi.fi</cas:clientName>
                <cas:displayName>Tessa Testilä</cas:displayName>
                <cas:vtjVerified>true</cas:vtjVerified>
                <cas:givenName>Tessa</cas:givenName>
                <cas:notOnOrAfter>2023-03-23T05:18:32.713Z</cas:notOnOrAfter>
                <cas:cn>Testilä Tessa</cas:cn>
                <cas:sn>Testilä</cas:sn>
                <cas:notBefore>2023-03-23T05:13:32.713Z</cas:notBefore>
                <cas:nationalIdentificationNumber>010280-952L</cas:nationalIdentificationNumber>
                <cas:personOid>1.2.246.562.24.40675408602</cas:personOid>
              </cas:attributes>
          </cas:authenticationSuccess>
        </cas:serviceResponse>""";

  @Override
  public String validateTicket(final String ticket) throws JsonProcessingException {
      final Mono<String> response = webClient
        .get()
        .uri(uriBuilder ->
          uriBuilder.queryParam("service", "http://localhost:4002/vkt/tunnistaudu").queryParam("ticket", ticket).build()
        )
        .retrieve()
        .bodyToMono(String.class);

      final String result = response.block();

    LOG.info("response: {}", result);

    return parseCasResponse(result);
  }

  private String parseCasResponse(final String result) throws JsonProcessingException {
    final Map<String, String> map = XML_MAPPER.readValue(result, new TypeReference<>() {});
    LOG.info("parsed, {}", map);
    return "test";
  }
}
