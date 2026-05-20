package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchDTO;
import fi.oph.yki.api.dto.clerk.ClerkQuarantinePersonDTO;
import fi.oph.yki.api.dto.clerk.ClerkQuarantineReviewDTO;
import fi.oph.yki.api.dto.clerk.ClerkQuarantinesDTO;
import fi.oph.yki.api.dto.clerk.CreateQuarantineRequest;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.model.Quarantine;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.QuarantineMatchProjection;
import fi.oph.yki.repository.QuarantineRepository;
import fi.oph.yki.repository.QuarantineReviewProjection;
import fi.oph.yki.repository.QuarantineReviewRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.HetuUtils;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
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

  @Transactional(readOnly = true)
  public List<ClerkQuarantinesDTO> getActiveQuarantine() {
    var quarantines = quarantineRepository
      .findAll()
      .stream()
      .filter(q -> q.getDeletedAt() == null)
      .sorted(Comparator.comparingLong(Quarantine::getId).reversed())
      .map(quarantine -> {
        final ClerkQuarantinePersonDTO quarantinedPerson = ClerkQuarantinePersonDTO
          .builder()
          .firstName(quarantine.getFirstName())
          .lastName(quarantine.getLastName())
          .birthdate(quarantine.getBirthdate())
          .ssn(quarantine.getSsn())
          .email(quarantine.getEmail())
          .phoneNumber(quarantine.getPhoneNumber())
          .build();

        return ClerkQuarantinesDTO
          .builder()
          .id(quarantine.getId())
          .startDate(quarantine.getStartDate())
          .endDate(quarantine.getEndDate())
          .languageCode(quarantine.getLanguageCode().trim())
          .quarantinedPerson(quarantinedPerson)
          .build();
      })
      .collect(Collectors.toList());

    auditService.logOperation(YkiOperation.GET_ACTIVE_QUARANTINES);
    return quarantines;
  }

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

  @Transactional(readOnly = true)
  public List<ClerkQuarantineReviewDTO> getReviews() {
    final List<ClerkQuarantineReviewDTO> reviews = quarantineReviewRepository
      .findAllReviews()
      .stream()
      .map(p -> {
        final ClerkQuarantinePersonDTO quarantinedPerson = ClerkQuarantinePersonDTO
          .builder()
          .firstName(p.getFirstName())
          .lastName(p.getLastName())
          .birthdate(p.getBirthdate())
          .ssn(p.getSsn())
          .email(p.getEmail())
          .phoneNumber(p.getPhoneNumber())
          .build();

        final ClerkQuarantinePersonDTO registrant = ClerkQuarantinePersonDTO
          .builder()
          .firstName(p.getFormFirstName())
          .lastName(p.getFormLastName())
          .birthdate(p.getFormBirthdate())
          .email(p.getFormEmail())
          .phoneNumber(p.getFormPhoneNumber())
          .build();

        return ClerkQuarantineReviewDTO
          .builder()
          .id(p.getId())
          .quarantined(Boolean.TRUE.equals(p.getQuarantined()))
          .quarantineId(p.getQuarantineId())
          .registrationId(p.getRegistrationId())
          .updated(p.getUpdated())
          .examDate(p.getExamDate())
          .languageCode(p.getLanguageCode() != null ? p.getLanguageCode().trim() : null)
          .levelCode(p.getLevelCode() != null ? p.getLevelCode().trim() : null)
          .state(p.getState())
          .quarantinedPerson(quarantinedPerson)
          .registrant(registrant)
          .build();
      })
      .toList();

    auditService.logOperation(YkiOperation.GET_QUARANTINE_REVIEWS);

    return reviews;
  }

  @Transactional
  public void createQuarantine(final CreateQuarantineRequest request) {
    final String resolvedBirthdate = resolveBirthdate(request.ssn(), request.birthdate());

    final Quarantine quarantine = new Quarantine();
    quarantine.setLanguageCode(request.languageCode());
    quarantine.setStartDate(request.startDate());
    quarantine.setEndDate(request.endDate());
    quarantine.setFirstName(request.firstName());
    quarantine.setLastName(request.lastName());
    quarantine.setDiaryNumber(request.diaryNumber());
    quarantine.setBirthdate(resolvedBirthdate);
    quarantine.setSsn(request.ssn());
    quarantine.setEmail(request.email());
    quarantine.setPhoneNumber(request.phoneNumber());

    final Quarantine saved;
    try {
      saved = quarantineRepository.save(quarantine);
    } catch (DataIntegrityViolationException e) {
      if (e.getMessage() != null && e.getMessage().contains("quarantine_diary_number_key")) {
        throw new APIException(APIExceptionType.QUARANTINE_DIARY_NUMBER_ALREADY_EXISTS);
      }
      throw e;
    }
    auditService.logClerkById(YkiOperation.CREATE_QUARANTINE, String.valueOf(saved.getId()));
  }

  @Transactional
  public void updateQuarantine(final long id, final CreateQuarantineRequest request) {
    final Quarantine quarantine = quarantineRepository
      .findById(id)
      .orElseThrow(() -> new APIException(APIExceptionType.NOT_FOUND));

    final String resolvedBirthdate = resolveBirthdate(request.ssn(), request.birthdate());

    quarantine.setLanguageCode(request.languageCode());
    quarantine.setStartDate(request.startDate());
    quarantine.setEndDate(request.endDate());
    quarantine.setFirstName(request.firstName());
    quarantine.setLastName(request.lastName());
    quarantine.setDiaryNumber(request.diaryNumber());
    quarantine.setBirthdate(resolvedBirthdate);
    quarantine.setSsn(request.ssn());
    quarantine.setEmail(request.email());
    quarantine.setPhoneNumber(request.phoneNumber());
    quarantine.setUpdated(LocalDateTime.now());

    quarantineRepository.save(quarantine);
    auditService.logClerkById(YkiOperation.UPDATE_QUARANTINE, String.valueOf(id));
  }

  private String resolveBirthdate(final String ssn, final LocalDate birthdate) {
    if (ssn == null && birthdate == null) {
      throw new APIException(APIExceptionType.QUARANTINE_MISSING_SSN_AND_BIRTHDATE);
    }
    if (ssn != null && !HetuUtils.hetuIsValid(ssn)) {
      throw new APIException(APIExceptionType.QUARANTINE_INVALID_SSN);
    }
    if (ssn != null && birthdate != null) {
      if (!HetuUtils.dateFromHetu(ssn).equals(birthdate)) {
        throw new APIException(APIExceptionType.QUARANTINE_SSN_BIRTHDATE_MISMATCH);
      }
      return birthdate.format(DateTimeFormatter.ISO_LOCAL_DATE);
    }
    if (ssn != null) {
      return HetuUtils.dateFromHetu(ssn).format(DateTimeFormatter.ISO_LOCAL_DATE);
    }
    return birthdate.format(DateTimeFormatter.ISO_LOCAL_DATE);
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
