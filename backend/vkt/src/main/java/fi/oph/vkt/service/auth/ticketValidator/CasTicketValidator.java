package fi.oph.vkt.service.auth.ticketValidator;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class CasTicketValidator implements TicketValidator {

  private static final XmlMapper XML_MAPPER = new XmlMapper();

  private final WebClient webClient;

  @Override
  public CasResponse validateTicket(final String ticket) throws JsonProcessingException {
    final Mono<String> response = webClient
      .get()
      .uri(uriBuilder ->
        uriBuilder.queryParam("service", "http://localhost:4002/vkt/tunnistaudu").queryParam("ticket", ticket).build()
      )
      .retrieve()
      .bodyToMono(String.class);

    final String result = response.block();

    return parseCasResponse(result);
  }

  private CasResponse parseCasResponse(final String result) throws JsonProcessingException {
    return XML_MAPPER.readValue(result, new TypeReference<>() {});
  }
}
