package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchDTO;
import fi.oph.yki.api.dto.clerk.ClerkQuarantinePersonDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.QuarantineMatchProjection;
import fi.oph.yki.repository.QuarantineRepository;
import fi.oph.yki.repository.QuarantineReviewRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.HetuUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkQuarantineService {

  private static final Logger LOG = LoggerFactory.getLogger(ClerkQuarantineService.class);

  private final QuarantineRepository quarantineRepository;
  private final RegistrationRepository registrationRepository;
  private final QuarantineReviewRepository quarantineReviewRepository;
  private final OnrService onrService;
  private final AuditService auditService;

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
  public List<ClerkQuarantineMatchDTO> getQuarantineMatches() {
    // Returns quarantine+registrations pairs
    final List<QuarantineMatchProjection> projections = quarantineRepository.findPendingMatches();

    final List<String> oids = projections
      .stream()
      .map(QuarantineMatchProjection::getPersonOid)
      .filter(Objects::nonNull)
      .distinct()
      .collect(Collectors.toList());

    final Map<String, String> oidToSsn = oids.isEmpty() ? Map.of() : getOidToSsnMap(oids);

    final List<ClerkQuarantineMatchDTO> matches = projections
      .stream()
      .map(proj -> {
        final ClerkQuarantinePersonDTO quarantinedPerson = ClerkQuarantinePersonDTO
          .builder()
          .firstName(proj.getFirstName())
          .lastName(proj.getLastName())
          .birthdate(proj.getBirthdate())
          .ssn(proj.getSsn())
          .email(proj.getEmail())
          .phoneNumber(proj.getPhoneNumber())
          .build();

        final String registrantSsn = proj.getPersonOid() != null ? oidToSsn.get(proj.getPersonOid()) : null;

        final ClerkQuarantinePersonDTO registrant = ClerkQuarantinePersonDTO
          .builder()
          .firstName(proj.getFormFirstName())
          .lastName(proj.getFormLastName())
          .birthdate(proj.getFormBirthdate())
          .ssn(registrantSsn)
          .email(proj.getFormEmail())
          .phoneNumber(proj.getFormPhoneNumber())
          .build();

        return ClerkQuarantineMatchDTO
          .builder()
          .id(proj.getQuarantineId())
          .quarantineLang(proj.getQuarantineLang().trim())
          .created(proj.getCreated())
          .quarantinedPerson(quarantinedPerson)
          .registrant(registrant)
          .registrationId(proj.getRegistrationId())
          .state(proj.getState())
          .examDate(proj.getExamDate())
          .languageCode(proj.getLanguageCode().trim())
          .levelCode(proj.getLevelCode().trim())
          .build();
      })
      .collect(Collectors.toList());

    auditService.logOperation(YkiOperation.GET_QUARANTINE_MATCHES);

    return matches;
  }

  @Transactional
  public void setQuarantineReview(final long quarantineId, final long registrationId, final boolean matchConfirmed) {
    final String reviewerOid = SecurityContextHolder.getContext().getAuthentication().getName();

    if (matchConfirmed) {
      registrationRepository.cancel(registrationId);
    }

    long quarantineReviewId = quarantineReviewRepository.upsertReview(
      quarantineId,
      registrationId,
      matchConfirmed,
      reviewerOid
    );

    auditService.logClerkById(YkiOperation.SET_QUARANTINE_REVIEW, String.valueOf(quarantineReviewId));
  }
}
