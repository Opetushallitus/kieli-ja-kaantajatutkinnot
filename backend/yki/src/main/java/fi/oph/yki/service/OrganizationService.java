package fi.oph.yki.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.service.dto.OrganizationDetailsDTO;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class OrganizationService {

  private static final Logger LOG = LoggerFactory.getLogger(OrganizationService.class);
  private static final List<String> NAME_LANGUAGE_FALLBACK_ORDER = List.of("fi", "sv", "en");

  private final ObjectMapper objectMapper;
  private final WebClient organizationClient;

  @SuppressWarnings("unchecked")
  public Map<String, String> getOrganizationNames(final Collection<String> oids) {
    if (oids == null || oids.isEmpty()) {
      return Map.of();
    }

    try {
      final String responseBody = organizationClient
        .post()
        .uri("/api/findbyoids")
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(oids)
        .retrieve()
        .bodyToMono(String.class)
        .block();

      final List<Map<String, Object>> organizations = objectMapper.readValue(responseBody, new TypeReference<>() {});

      return organizations
        .stream()
        .collect(
          Collectors.toMap(
            org -> (String) org.get("oid"),
            org -> {
              final Map<String, String> nimi = (Map<String, String>) org.get("nimi");
              return nimi != null ? nimi.getOrDefault("fi", "") : "";
            },
            (existing, replacement) -> existing
          )
        );
    } catch (final Exception e) {
      LOG.error("Failed to fetch organization names for OIDs: {}", oids, e);
      throw new RuntimeException("Failed to fetch organization names", e);
    }
  }

  /**
   * Fetches full organization details (address, contact info) needed for SOLKI organizer sync.
   * Uses organisaatio-palvelu's single-organization endpoint (as opposed to the bulk
   * findbyoids endpoint used by {@link #getOrganizationNames}), matching the endpoint the
   * legacy Clojure integration uses for this same purpose.
   */
  @SuppressWarnings("unchecked")
  public OrganizationDetailsDTO getOrganizationDetails(final String oid) {
    try {
      final String responseBody = organizationClient
        .get()
        .uri("/rest/organisaatio/v4/{oid}", oid)
        .retrieve()
        .bodyToMono(String.class)
        .block();

      final Map<String, Object> organization = objectMapper.readValue(responseBody, new TypeReference<>() {});

      final Map<String, String> nimi = (Map<String, String>) organization.get("nimi");
      final String name = NAME_LANGUAGE_FALLBACK_ORDER
        .stream()
        .map(lang -> nimi != null ? nimi.get(lang) : null)
        .filter(n -> n != null && !n.isEmpty())
        .findFirst()
        .orElse("");

      final Map<String, Object> postiosoite = (Map<String, Object>) organization.get("postiosoite");
      final String streetAddress = postiosoite != null ? (String) postiosoite.get("osoite") : null;
      final String postOffice = postiosoite != null ? (String) postiosoite.get("postitoimipaikka") : null;
      final String postinumeroUri = postiosoite != null ? (String) postiosoite.get("postinumeroUri") : null;
      final String postalCode = postinumeroUri != null
        ? postinumeroUri.substring(postinumeroUri.lastIndexOf('_') + 1)
        : null;

      final List<Map<String, Object>> yhteystiedot = (List<Map<String, Object>>) organization.get("yhteystiedot");
      final String website = yhteystiedot == null
        ? ""
        : yhteystiedot
          .stream()
          .filter(contact -> contact.get("www") != null)
          .map(contact -> (String) contact.get("www"))
          .findFirst()
          .orElse("");

      return new OrganizationDetailsDTO(oid, name, streetAddress, postalCode, postOffice, website);
    } catch (final Exception e) {
      LOG.error("Failed to fetch organization details for OID: {}", oid, e);
      throw new RuntimeException("Failed to fetch organization details", e);
    }
  }
}
