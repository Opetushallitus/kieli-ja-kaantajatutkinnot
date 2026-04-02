package fi.oph.yki.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchDTO;
import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchesResponseDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.QuarantineMatchProjection;
import fi.oph.yki.repository.QuarantineRepository;
import fi.oph.yki.util.HetuUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkQuarantineService {

  private static final Logger LOG = LoggerFactory.getLogger(ClerkQuarantineService.class);

  private final QuarantineRepository quarantineRepository;
  private final OnrService onrService;
  private final AuditService auditService;
  private final ObjectMapper objectMapper;

  private Map<String, String> getOidToSsnMap(final List<String> oids) {
    try {
      return onrService
        .listPersonDetails(oids)
        .stream()
        .filter(dto -> dto.getIdentityNumber() != null)
        .collect(Collectors.toMap(PersonalDataDTO::getOidHenkilo, PersonalDataDTO::getIdentityNumber));
    } catch (final Exception e) {
      LOG.error("Unable to get identity numbers from ONR", e);
      return Map.of();
    }
  }

  @Transactional(readOnly = true)
  public ClerkQuarantineMatchesResponseDTO getQuarantineMatches() throws JsonProcessingException {
    final List<QuarantineMatchProjection> projections = quarantineRepository.findPendingMatches();

    final List<String> oids = projections
      .stream()
      .map(QuarantineMatchProjection::getPersonOid)
      .filter(Objects::nonNull)
      .distinct()
      .collect(Collectors.toList());

    final Map<String, String> oidToSsn = oids.isEmpty() ? Map.of() : getOidToSsnMap(oids);

    final List<ClerkQuarantineMatchDTO> matches = new ArrayList<>();
    for (final QuarantineMatchProjection proj : projections) {
      final ObjectNode form = (ObjectNode) objectMapper.readTree(proj.getForm());

      // Original behavior: compute birthdate from original form.ssn BEFORE overwriting it with ONR SSN
      final String originalFormSsn = form.hasNonNull("ssn") ? form.get("ssn").asText(null) : null;
      if (!form.hasNonNull("birthdate") && originalFormSsn != null) {
        form.put("birthdate", HetuUtils.dateFromHetu(originalFormSsn).toString());
      }

      form.put("ssn", oidToSsn.get(proj.getPersonOid()));

      matches.add(
        new ClerkQuarantineMatchDTO(
          proj.getQuarantineId(),
          proj.getQuarantineLang().trim(),
          proj.getBirthdate(),
          proj.getCreated(),
          proj.getSsn(),
          proj.getFirstName(),
          proj.getLastName(),
          proj.getEmail(),
          proj.getPhoneNumber(),
          proj.getRegistrationId(),
          form,
          proj.getState(),
          proj.getExamDate(),
          proj.getLanguageCode().trim()
        )
      );
    }

    auditService.logOperation(YkiOperation.GET_QUARANTINE_MATCHES);

    return new ClerkQuarantineMatchesResponseDTO(matches);
  }
}
