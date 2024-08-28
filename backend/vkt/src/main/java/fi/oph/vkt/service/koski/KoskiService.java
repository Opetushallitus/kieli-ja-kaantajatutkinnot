package fi.oph.vkt.service.koski;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.api.dto.PublicEducationDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.FreeEnrollment;
import fi.oph.vkt.model.KoskiEducations;
import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.model.type.FreeEnrollmentType;
import fi.oph.vkt.repository.KoskiEducationsRepository;
import fi.oph.vkt.service.koski.dto.KoskiResponseDTO;
import fi.oph.vkt.service.koski.dto.KoulutusTyyppi;
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
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class KoskiService {

  private static final Logger LOG = LoggerFactory.getLogger(KoskiService.class);
  private static final int REQUEST_ATTEMPTS = 3;

  private final WebClient koskiClient;
  private final KoskiEducationsRepository koskiEducationsRepository;

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
      final int retries = attemptsRemaining - 1;
      LOG.error(
        "KOSKI request for OID {} returned error status {}\n response body: {}, Retries remaining: {}",
        oid,
        e.getStatusCode().value(),
        e.getResponseBodyAsString(),
        retries
      );
      if (retries > 0) {
        return requestWithRetries(oid, retries);
      } else {
        throw e;
      }
    } catch (final Exception e) {
      final int retries = attemptsRemaining - 1;
      LOG.error("KOSKI request failed for unknown reason! Retries remaining: {}, OID: {}", retries, oid, e);
      if (retries > 0) {
        return requestWithRetries(oid, retries);
      } else {
        throw e;
      }
    }
  }

  private Boolean filterByState(final OpiskeluoikeusDTO opiskeluoikeus) {
    if (opiskeluoikeus.getTyyppi() == null) {
      return false;
    }

    final KoulutusTyyppi koulutusTyyppi = opiskeluoikeus.getTyyppi().getKoodiarvo();
    if (koulutusTyyppi == null) {
      return false;
    }

    // Other education types are automatically accepted,
    // higher education must have active or concluded status
    if (!koulutusTyyppi.equals(KoulutusTyyppi.HigherEducation)) {
      return true;
    }

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

  public List<PublicEducationDTO> findEducations(final String oid) {
    try {
      final ObjectMapper objectMapper = new ObjectMapper();
      objectMapper.configure(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL, true);

      final String response = requestWithRetries(oid, REQUEST_ATTEMPTS);
      final KoskiResponseDTO koskiResponseDTO = objectMapper.readValue(response, KoskiResponseDTO.class);

      if (koskiResponseDTO.getHenkilo() == null || !oid.equals(koskiResponseDTO.getHenkilo().getOid())) {
        throw new Exception(
          String.format("KOSKI OID (%s) does not match provided OID (%s)", koskiResponseDTO.getHenkilo().getOid(), oid)
        );
      }

      return koskiResponseDTO
        .getOpiskeluoikeudet()
        .stream()
        .filter(this::filterByState)
        .map(k ->
          PublicEducationDTO
            .builder()
            .educationType(k.getTyyppi().getKoodiarvo().toString())
            .isActive(isActive(k))
            .build()
        )
        .filter(distinctByKey(PublicEducationDTO::educationType))
        .toList();
    } catch (final Exception e) {
      LOG.error("KOSKI failed due to unknown error", e);

      return List.of();
    }
  }

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public KoskiEducations saveEducationsForEnrollment(
    final FreeEnrollment freeEnrollment,
    final long examEventId,
    List<PublicEducationDTO> educationDTOs
  ) {
    final KoskiEducations koskiEducations = new KoskiEducations();
    koskiEducations.setFreeEnrollmentId(freeEnrollment.getId());
    koskiEducations.setExamEventId(examEventId);

    Set<FreeEnrollmentType> freeEnrollmentTypes = educationDTOs
      .stream()
      .map(FreeEnrollmentType::fromEducationDTO)
      .collect(Collectors.toSet());

    koskiEducations.setMatriculationExam(freeEnrollmentTypes.contains(FreeEnrollmentType.MatriculationExam));
    koskiEducations.setHigherEducationConcluded(
      freeEnrollmentTypes.contains(FreeEnrollmentType.HigherEducationConcluded)
    );
    koskiEducations.setHigherEducationEnrolled(
      freeEnrollmentTypes.contains(FreeEnrollmentType.HigherEducationEnrolled)
    );
    koskiEducations.setDia(freeEnrollmentTypes.contains(FreeEnrollmentType.DIA));
    koskiEducations.setEb(freeEnrollmentTypes.contains(FreeEnrollmentType.EB));
    koskiEducations.setOther(freeEnrollmentTypes.contains(FreeEnrollmentType.Other));

    koskiEducationsRepository.saveAndFlush(koskiEducations);
    return koskiEducations;
  }
}
