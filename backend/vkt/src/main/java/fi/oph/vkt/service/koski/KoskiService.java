package fi.oph.vkt.service.koski;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.api.dto.PublicEducationDTO;
import fi.oph.vkt.service.koski.dto.KoskiResponseDTO;
import fi.oph.vkt.service.koski.dto.OpiskeluoikeusDTO;
import fi.oph.vkt.service.koski.dto.OpiskeluoikeusjaksoDTO;
import fi.oph.vkt.service.koski.dto.OpiskeluoikeusjaksoTila;
import fi.oph.vkt.service.koski.dto.RequestBody;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class KoskiService {

  private static final Logger LOG = LoggerFactory.getLogger(KoskiService.class);
  private static final int REQUEST_ATTEMPTS = 3;

  private final WebClient koskiClient;

  private static <T> Predicate<T> distinctByKey(final Function<? super T, ?> keyExtractor) {
    final Set<Object> seen = ConcurrentHashMap.newKeySet();
    return t -> seen.add(keyExtractor.apply(t));
  }

  private String requestWithRetries(final String oid, final int attemptsRemaining) throws JsonProcessingException {
    try {
      final ObjectMapper objectMapper = new ObjectMapper();
      final RequestBody body = new RequestBody(oid);
      final String bodyJson = objectMapper.writeValueAsString(body);

      return koskiClient
        .post()
        .uri("/oid")
        .bodyValue(bodyJson)
        .exchangeToMono(clientResponse -> {
          if (clientResponse.statusCode().isError()) {
            return clientResponse.createException().flatMap(Mono::error);
          }
          return clientResponse.bodyToMono(String.class);
        })
        .block();
    } catch (final WebClientResponseException e) {
      LOG.error(
        "KOSKI returned error status {}\n response body: {}",
        e.getStatusCode().value(),
        e.getResponseBodyAsString()
      );
      throw new RuntimeException(e);
    } catch (final Exception e) {
      final int retries = attemptsRemaining - 1;
      LOG.error("KOSKI request failed! Retries remaining: {}", retries, e);
      if (retries > 0) {
        return requestWithRetries(oid, retries);
      } else {
        throw e;
      }
    }
  }

  private Boolean filterByState(final OpiskeluoikeusDTO opiskeluoikeus) {
    final OpiskeluoikeusjaksoTila latestState = findLatestState(opiskeluoikeus);

    return (
      latestState != null &&
      (latestState.equals(OpiskeluoikeusjaksoTila.ACTIVE) || latestState.equals(OpiskeluoikeusjaksoTila.CONCLUDED))
    );
  }

  private OpiskeluoikeusjaksoTila findLatestState(final OpiskeluoikeusDTO opiskeluoikeus) {
    final Optional<OpiskeluoikeusjaksoDTO> latestOpiskeluoikeusjakso = opiskeluoikeus
      .getTila()
      .getOpiskeluoikeusjaksot()
      .stream()
      .max(Comparator.comparing(OpiskeluoikeusjaksoDTO::getAlku));

    return latestOpiskeluoikeusjakso
      .map(opiskeluoikeusjaksoDTO -> opiskeluoikeusjaksoDTO.getTila().getKoodiarvo())
      .orElse(null);
  }

  private Boolean isActive(final OpiskeluoikeusDTO opiskeluoikeus) {
    final OpiskeluoikeusjaksoTila latestState = findLatestState(opiskeluoikeus);

    return (latestState != null && latestState.equals(OpiskeluoikeusjaksoTila.ACTIVE));
  }

  public List<PublicEducationDTO> findEducations(final String oid) throws JsonProcessingException {
    final ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.configure(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL, true);

    final KoskiResponseDTO koskiResponseDTO = objectMapper.readValue(
      requestWithRetries(oid, REQUEST_ATTEMPTS),
      KoskiResponseDTO.class
    );

    return koskiResponseDTO
      .getOpiskeluoikeudet()
      .stream()
      .filter(this::filterByState)
      .map(k -> PublicEducationDTO.builder().educationType(k.getTyyppi().getKoodiarvo()).isActive(isActive(k)).build())
      .filter(distinctByKey(PublicEducationDTO::educationType))
      .toList();
  }
}
