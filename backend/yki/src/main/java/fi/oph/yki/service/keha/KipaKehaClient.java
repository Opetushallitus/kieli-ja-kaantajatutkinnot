package fi.oph.yki.service.keha;

import fi.oph.yki.service.keha.dto.YkiTietopyyntoDTO;
import fi.oph.yki.service.keha.dto.YkiVastausDTO;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.core.publisher.Mono;

/**
 * KEHA A-TMT personal data query service, KIPA P81 POST /v1/yki.
 * The request body contains the SSN, so it is never logged.
 */
@Component
@ConditionalOnProperty(name = "app.keha.mock.enabled", havingValue = "false")
public class KipaKehaClient implements KehaClient {

  private static final Logger LOG = LoggerFactory.getLogger(KipaKehaClient.class);

  static final String CORRELATION_ID_HEADER = "KIPA-CorrelationId";
  private static final String MESSAGE_ID_HEADER = "KIPA-MessageId";

  // The participant waits on the registration form, so keep the worst case at about ten seconds.
  private static final int REQUEST_ATTEMPTS = 2;
  private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(5);

  private final WebClient kipaClient;
  private final KehaTokenProvider tokenProvider;
  private final Duration requestTimeout;

  @Autowired
  public KipaKehaClient(@Qualifier("kipaClient") final WebClient kipaClient, final KehaTokenProvider tokenProvider) {
    this(kipaClient, tokenProvider, REQUEST_TIMEOUT);
  }

  KipaKehaClient(final WebClient kipaClient, final KehaTokenProvider tokenProvider, final Duration requestTimeout) {
    this.kipaClient = kipaClient;
    this.tokenProvider = tokenProvider;
    this.requestTimeout = requestTimeout;
  }

  @Override
  public KehaDecision checkEligibility(final String ssn, final UUID personUuid, final UUID correlationId) {
    final YkiTietopyyntoDTO body = YkiTietopyyntoDTO.builder().hetu(ssn).kayttajaTunniste(personUuid).build();

    for (int attempt = 1;; attempt++) {
      try {
        return request(body, correlationId);
      } catch (final KehaException e) {
        if (!e.isRetryable() || attempt >= REQUEST_ATTEMPTS) {
          throw e;
        }
        LOG.warn(
          "KEHA request failed, retrying. personUuid: {}, correlationId: {}, attempt: {}, detail: {}",
          personUuid,
          correlationId,
          attempt,
          e.getMessage()
        );
      }
    }
  }

  private KehaDecision request(final YkiTietopyyntoDTO body, final UUID correlationId) {
    return kipaClient
      .post()
      .uri("/v1/yki")
      .headers(headers -> {
        headers.setBearerAuth(tokenProvider.getToken());
        headers.set(CORRELATION_ID_HEADER, correlationId.toString());
      })
      .bodyValue(body)
      .exchangeToMono(response -> toDecision(response, body.kayttajaTunniste(), correlationId))
      .timeout(requestTimeout)
      .onErrorMap(TimeoutException.class, e -> new KehaException("timeout", true, e))
      .onErrorMap(WebClientRequestException.class, e -> new KehaException("connection failed", true, e))
      .onErrorMap(e -> !(e instanceof KehaException), e -> new KehaException("invalid response", false, e))
      .block();
  }

  private static Mono<KehaDecision> toDecision(
    final ClientResponse response,
    final UUID personUuid,
    final UUID correlationId
  ) {
    final HttpStatusCode status = response.statusCode();
    final String messageId = response.headers().asHttpHeaders().getFirst(MESSAGE_ID_HEADER);

    if (status.is2xxSuccessful()) {
      return response
        .bodyToMono(YkiVastausDTO.class)
        .defaultIfEmpty(YkiVastausDTO.builder().build())
        .flatMap(vastaus -> {
          if (vastaus.ykiTutkintoOikeus() == null) {
            LOG.error(
              "KEHA returned no decision. personUuid: {}, correlationId: {}, messageId: {}, virhe: {}",
              personUuid,
              correlationId,
              messageId,
              vastaus.virhe()
            );
            return Mono.error(new KehaException("no decision", false));
          }
          LOG.info(
            "KEHA check done. personUuid: {}, correlationId: {}, messageId: {}",
            personUuid,
            correlationId,
            messageId
          );
          return Mono.just(vastaus.ykiTutkintoOikeus() ? KehaDecision.ELIGIBLE : KehaDecision.NOT_ELIGIBLE);
        });
    }

    // TODO confirm with KEHA: "person not found" is assumed to mean that the person is not an A-TMT customer.
    if (status.value() == 404) {
      LOG.info(
        "KEHA did not find the person. personUuid: {}, correlationId: {}, messageId: {}",
        personUuid,
        correlationId,
        messageId
      );
      return response.releaseBody().thenReturn(KehaDecision.NOT_ELIGIBLE);
    }

    // The error body is not logged: a validation error might repeat the SSN.
    LOG.error(
      "KEHA returned error status {}. personUuid: {}, correlationId: {}, messageId: {}",
      status.value(),
      personUuid,
      correlationId,
      messageId
    );
    return response
      .releaseBody()
      .then(Mono.error(new KehaException("HTTP " + status.value(), status.is5xxServerError())));
  }
}
