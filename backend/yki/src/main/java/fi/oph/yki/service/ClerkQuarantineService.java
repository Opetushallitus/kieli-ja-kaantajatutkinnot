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

    final List<ClerkQuarantineMatchDTO> matches = new ArrayList<>();
    for (final QuarantineMatchProjection proj : projections) {
      final ClerkQuarantinePersonDTO quarantinedPerson = ClerkQuarantinePersonDTO
        .builder()
        .firstName(proj.getFirstName())
        .lastName(proj.getLastName())
        .birthdate(proj.getBirthdate())
        .ssn(proj.getSsn())
        .email(proj.getEmail())
        .phoneNumber(proj.getPhoneNumber())
        .build();

      // Get the birthday from the form if it is set.
      // Otherwise, if SSN is set in the form, try to calculate the birthdate from given SSN.
      final String formBirthdate = proj.getFormBirthdate() != null
        ? proj.getFormBirthdate()
        : (proj.getFormSsn() != null ? HetuUtils.dateFromHetu(proj.getFormSsn()).toString() : null);

      // the logic is inherited from old yki backend,
      // which doesn't use form.ssn except for possible birthdate calculation (the line above)
      final String formSsn = proj.getPersonOid() != null ? oidToSsn.get(proj.getPersonOid()) : null;

      final ClerkQuarantinePersonDTO registrant = ClerkQuarantinePersonDTO
        .builder()
        .firstName(proj.getFormFirstName())
        .lastName(proj.getFormLastName())
        .birthdate(formBirthdate)
        .ssn(formSsn)
        .email(proj.getFormEmail())
        .phoneNumber(proj.getFormPhoneNumber())
        .build();

      matches.add(
        ClerkQuarantineMatchDTO
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
          .build()
      );
    }

    auditService.logOperation(YkiOperation.GET_QUARANTINE_MATCHES);

    return matches;
  }

  @Transactional
  public void setQuarantineReview(final long quarantineId, final long registrationId, final boolean isQuarantined) {
    final String reviewerOid = SecurityContextHolder.getContext().getAuthentication().getName();

    if (isQuarantined) {
      registrationRepository.cancel(registrationId);
    }

    long quarantineReviewId = quarantineReviewRepository.upsertReview(
      quarantineId,
      registrationId,
      isQuarantined,
      reviewerOid
    );

    auditService.logClerkById(YkiOperation.SET_QUARANTINE_REVIEW, String.valueOf(quarantineReviewId));
  }
}
