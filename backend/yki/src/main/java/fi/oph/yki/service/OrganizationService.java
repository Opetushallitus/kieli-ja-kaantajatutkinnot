package fi.oph.yki.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

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

      final List<Map<String, Object>> organizations = OBJECT_MAPPER.readValue(responseBody, new TypeReference<>() {});

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
}
