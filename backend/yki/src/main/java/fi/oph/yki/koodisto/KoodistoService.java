package fi.oph.yki.koodisto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.config.CacheConfig;
import fi.oph.yki.koodisto.dto.KoodistoRelationDTO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@RequiredArgsConstructor
public class KoodistoService {

  private static final Logger LOG = LoggerFactory.getLogger(KoodistoService.class);

  // Country codes as used by SOLKI (maatjavaltiot1, e.g. "FIN") differ from the codes
  // used elsewhere in Opintopolku (maatjavaltiot2, e.g. "246") - koodisto-service holds
  // the mapping between the two as a "rinnasteinen" (parallel) relation.
  private static final String COUNTRY_CODES_1_KOODISTO_URI = "maatjavaltiot1";
  private static final String COUNTRY_CODES_2_PREFIX = "maatjavaltiot2_";

  private final ObjectMapper objectMapper;
  private final WebClient koodistoClient;

  @Cacheable(CacheConfig.KOODISTO_CACHE)
  public String getConvertedCountryCode(final String countryCode) {
    if (countryCode == null || countryCode.isBlank()) {
      return null;
    }

    try {
      final String responseBody = koodistoClient
        .get()
        .uri("/rest/json/relaatio/rinnasteinen/{koodiUri}", COUNTRY_CODES_2_PREFIX + countryCode)
        .retrieve()
        .bodyToMono(String.class)
        .block();

      final List<KoodistoRelationDTO> relations = objectMapper.readValue(responseBody, new TypeReference<>() {});

      return relations
        .stream()
        .filter(relation -> relation.getKoodisto() != null)
        .filter(relation -> COUNTRY_CODES_1_KOODISTO_URI.equals(relation.getKoodisto().getKoodistoUri()))
        .map(KoodistoRelationDTO::getKoodiArvo)
        .findFirst()
        .orElse(null);
    } catch (final WebClientResponseException e) {
      if (e.getStatusCode().value() == 404) {
        return null;
      }
      LOG.error("Could not get country code from koodisto for {}", countryCode, e);
      throw new RuntimeException("Could not get country code from koodisto for " + countryCode, e);
    } catch (final Exception e) {
      LOG.error("Could not get country code from koodisto for {}", countryCode, e);
      throw new RuntimeException("Could not get country code from koodisto for " + countryCode, e);
    }
  }
}
