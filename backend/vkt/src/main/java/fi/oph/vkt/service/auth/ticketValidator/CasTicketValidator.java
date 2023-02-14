package fi.oph.vkt.service.auth.ticketValidator;

import lombok.RequiredArgsConstructor;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class CasTicketValidator implements TicketValidator {

  private final WebClient webClient;

  @Override
  public String validateTicket(final String ticket) {
    final Mono<String> response = webClient
      .get()
      .uri(uriBuilder ->
        uriBuilder.queryParam("service", "http://localhost:4002/vkt/tunnistaudu").queryParam("ticket", ticket).build()
      )
      .retrieve()
      .bodyToMono(String.class);

    return response.block();
  }
}
