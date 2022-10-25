package fi.oph.akr.service;

import fi.oph.akr.api.dto.LanguagePairDTO;
import fi.oph.akr.api.dto.LanguagePairsDictDTO;
import fi.oph.akr.api.dto.clerk.AuthorisationDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorAuthorisationsDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorResponseDTO;
import fi.oph.akr.api.dto.clerk.ExaminationDateDTO;
import fi.oph.akr.api.dto.clerk.MeetingDateDTO;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationCreateDTO;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationDTOCommonFields;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationPublishPermissionDTO;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationUpdateDTO;
import fi.oph.akr.api.dto.clerk.modify.TranslatorCreateDTO;
import fi.oph.akr.api.dto.clerk.modify.TranslatorDTOCommonFields;
import fi.oph.akr.api.dto.clerk.modify.TranslatorUpdateDTO;
import fi.oph.akr.audit.AkrOperation;
import fi.oph.akr.audit.AuditService;
import fi.oph.akr.config.CacheConfig;
import fi.oph.akr.model.Authorisation;
import fi.oph.akr.model.AuthorisationTermReminder;
import fi.oph.akr.model.ExaminationDate;
import fi.oph.akr.model.MeetingDate;
import fi.oph.akr.model.Translator;
import fi.oph.akr.repository.AuthorisationProjection;
import fi.oph.akr.repository.AuthorisationRepository;
import fi.oph.akr.repository.AuthorisationTermReminderRepository;
import fi.oph.akr.repository.ExaminationDateRepository;
import fi.oph.akr.repository.MeetingDateRepository;
import fi.oph.akr.repository.TranslatorRepository;
import fi.oph.akr.service.koodisto.CountryService;
import fi.oph.akr.util.AuthorisationUtil;
import fi.oph.akr.util.exception.APIException;
import fi.oph.akr.util.exception.APIExceptionType;
import fi.oph.akr.util.exception.DataIntegrityViolationExceptionUtil;
import fi.oph.akr.util.exception.NotFoundException;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkTranslatorService {

  @Resource
  private final AuthorisationRepository authorisationRepository;

  @Resource
  private final AuthorisationTermReminderRepository authorisationTermReminderRepository;

  @Resource
  private final ExaminationDateRepository examinationDateRepository;

  @Resource
  private final ExaminationDateService examinationDateService;

  @Resource
  private final MeetingDateRepository meetingDateRepository;

  @Resource
  private final MeetingDateService meetingDateService;

  @Resource
  private final TranslatorRepository translatorRepository;

  @Resource
  private final CountryService countryService;

  @Resource
  private final AuditService auditService;

  @Transactional(readOnly = true)
  public ClerkTranslatorResponseDTO listTranslators() {
    final ClerkTranslatorResponseDTO result = listTranslatorsWithoutAudit();
    auditService.logOperation(AkrOperation.LIST_TRANSLATORS);
    return result;
  }

  private ClerkTranslatorResponseDTO listTranslatorsWithoutAudit() {
    final List<Translator> translators = translatorRepository.findAllByOrderByLastNameAscFirstNameAsc();
    final Map<Long, List<AuthorisationProjection>> authorisationProjections = getAuthorisationProjections();

    final List<ClerkTranslatorDTO> clerkTranslatorDTOS = createClerkTranslatorDTOs(
      translators,
      authorisationProjections
    );
    final LanguagePairsDictDTO languagePairsDictDTO = getLanguagePairsDictDTO();
    final List<MeetingDateDTO> meetingDateDTOS = meetingDateService.listMeetingDatesWithoutAudit();
    final List<ExaminationDateDTO> examinationDateDTOS = examinationDateService.listExaminationDatesWithoutAudit();

    return ClerkTranslatorResponseDTO
      .builder()
      .translators(clerkTranslatorDTOS)
      .langs(languagePairsDictDTO)
      .meetingDates(meetingDateDTOS)
      .examinationDates(examinationDateDTOS)
      .build();
  }

  private Map<Long, List<AuthorisationProjection>> getAuthorisationProjections() {
    return authorisationRepository
      .listAuthorisationProjections()
      .stream()
      .collect(Collectors.groupingBy(AuthorisationProjection::translatorId));
  }

  private List<ClerkTranslatorDTO> createClerkTranslatorDTOs(
    final List<Translator> translators,
    final Map<Long, List<AuthorisationProjection>> authorisationProjectionsByTranslator
  ) {
    return translators
      .stream()
      .map(translator -> {
        final List<AuthorisationDTO> authorisationDTOS = createAuthorisationDTOs(
          authorisationProjectionsByTranslator.get(translator.getId())
        );
        final ClerkTranslatorAuthorisationsDTO translatorAuthorisationsDTO = splitAuthorisationDTOs(authorisationDTOS);

        return ClerkTranslatorDTO
          .builder()
          .id(translator.getId())
          .version(translator.getVersion())
          .firstName(translator.getFirstName())
          .lastName(translator.getLastName())
          .identityNumber(translator.getIdentityNumber())
          .email(translator.getEmail())
          .phoneNumber(translator.getPhone())
          .street(translator.getStreet())
          .postalCode(translator.getPostalCode())
          .town(translator.getTown())
          .country(translator.getCountry())
          .extraInformation(translator.getExtraInformation())
          .isAssuranceGiven(translator.isAssuranceGiven())
          .authorisations(translatorAuthorisationsDTO)
          .build();
      })
      .toList();
  }

  private List<AuthorisationDTO> createAuthorisationDTOs(final List<AuthorisationProjection> authorisationProjections) {
    return authorisationProjections
      .stream()
      .map(authProjection -> {
        final LanguagePairDTO languagePairDTO = LanguagePairDTO
          .builder()
          .from(authProjection.fromLang())
          .to(authProjection.toLang())
          .build();

        return AuthorisationDTO
          .builder()
          .id(authProjection.id())
          .version(authProjection.version())
          .languagePair(languagePairDTO)
          .basis(authProjection.authorisationBasis())
          .termBeginDate(authProjection.termBeginDate())
          .termEndDate(authProjection.termEndDate())
          .permissionToPublish(authProjection.permissionToPublish())
          .diaryNumber(authProjection.diaryNumber())
          .examinationDate(authProjection.examinationDate())
          .build();
      })
      .sorted(
        // Comparing by id used to preserve ordering of authorisations in UI on translator authorisation updates
        Comparator
          .comparing(AuthorisationDTO::termBeginDate, Comparator.nullsLast(Comparator.naturalOrder()))
          .thenComparing(AuthorisationDTO::id)
          .reversed()
      )
      .toList();
  }

  private ClerkTranslatorAuthorisationsDTO splitAuthorisationDTOs(final List<AuthorisationDTO> authorisationDTOS) {
    final Map<Boolean, List<AuthorisationDTO>> authorisationsByExistenceOfBeginDate = authorisationDTOS
      .stream()
      .collect(Collectors.partitioningBy(a -> a.termBeginDate() != null));

    final List<AuthorisationDTO> authorisationsWithBeginDate = authorisationsByExistenceOfBeginDate.get(true);

    final List<AuthorisationDTO> effective = AuthorisationUtil.filterEffectiveAuthorisations(
      authorisationsWithBeginDate
    );
    final List<AuthorisationDTO> expiring = AuthorisationUtil.filterExpiringAuthorisations(authorisationsWithBeginDate);
    final List<AuthorisationDTO> expired = AuthorisationUtil.filterExpiredAuthorisations(authorisationsWithBeginDate);
    final List<AuthorisationDTO> expiredDeduplicated = AuthorisationUtil.filterExpiredDeduplicates(expired, effective);
    final List<AuthorisationDTO> formerVir = authorisationsByExistenceOfBeginDate.get(false);

    return ClerkTranslatorAuthorisationsDTO
      .builder()
      .effective(effective)
      .expiring(expiring)
      .expired(expired)
      .expiredDeduplicated(expiredDeduplicated)
      .formerVir(formerVir)
      .build();
  }

  private LanguagePairsDictDTO getLanguagePairsDictDTO() {
    final List<String> fromLangs = authorisationRepository.getDistinctFromLangs();
    final List<String> toLangs = authorisationRepository.getDistinctToLangs();

    return LanguagePairsDictDTO.builder().from(fromLangs).to(toLangs).build();
  }

  @CacheEvict(cacheNames = CacheConfig.CACHE_NAME_PUBLIC_TRANSLATORS, allEntries = true)
  @Transactional
  public ClerkTranslatorDTO createTranslator(final TranslatorCreateDTO dto) {
    final Translator translator = new Translator();

    assertCountryCode(dto.country(), APIExceptionType.TRANSLATOR_CREATE_UNKNOWN_COUNTRY);

    copyDtoFieldsToTranslator(dto, translator);
    try {
      translatorRepository.saveAndFlush(translator);
    } catch (DataIntegrityViolationException ex) {
      if (DataIntegrityViolationExceptionUtil.isTranslatorEmailUniquenessException(ex)) {
        throw new APIException(APIExceptionType.TRANSLATOR_CREATE_DUPLICATE_EMAIL);
      }
      if (DataIntegrityViolationExceptionUtil.isTranslatorIdentityNumberUniquenessException(ex)) {
        throw new APIException(APIExceptionType.TRANSLATOR_CREATE_DUPLICATE_IDENTITY_NUMBER);
      }
      throw ex;
    }

    final Map<LocalDate, MeetingDate> meetingDates = getLocalDateMeetingDateMap();
    final Map<LocalDate, ExaminationDate> examinationDates = getLocalDateExaminationDateMap();

    dto.authorisations().forEach(authDto -> createAuthorisation(translator, meetingDates, examinationDates, authDto));

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logById(AkrOperation.CREATE_TRANSLATOR, translator.getId());
    return result;
  }

  @Transactional(readOnly = true)
  public ClerkTranslatorDTO getTranslator(final long translatorId) {
    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translatorId);
    auditService.logById(AkrOperation.GET_TRANSLATOR, translatorId);
    return result;
  }

  public ClerkTranslatorDTO getTranslatorWithoutAudit(final long translatorId) {
    // This could be optimized, by fetching only one translator and it's data, but is it worth of the programming work?
    for (ClerkTranslatorDTO t : listTranslatorsWithoutAudit().translators()) {
      if (t.id() == translatorId) {
        return t;
      }
    }
    throw new NotFoundException(String.format("Translator with id: %d not found", translatorId));
  }

  @CacheEvict(cacheNames = CacheConfig.CACHE_NAME_PUBLIC_TRANSLATORS, allEntries = true)
  @Transactional
  public ClerkTranslatorDTO updateTranslator(final TranslatorUpdateDTO dto) {
    final Translator translator = translatorRepository.getReferenceById(dto.id());

    translator.assertVersion(dto.version());
    assertCountryCode(dto.country(), APIExceptionType.TRANSLATOR_UPDATE_UNKNOWN_COUNTRY);

    copyDtoFieldsToTranslator(dto, translator);

    try {
      translatorRepository.flush();
    } catch (DataIntegrityViolationException ex) {
      if (DataIntegrityViolationExceptionUtil.isTranslatorEmailUniquenessException(ex)) {
        throw new APIException(APIExceptionType.TRANSLATOR_UPDATE_DUPLICATE_EMAIL);
      }
      if (DataIntegrityViolationExceptionUtil.isTranslatorIdentityNumberUniquenessException(ex)) {
        throw new APIException(APIExceptionType.TRANSLATOR_UPDATE_DUPLICATE_IDENTITY_NUMBER);
      }
      throw ex;
    }

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logById(AkrOperation.UPDATE_TRANSLATOR, translator.getId());
    return result;
  }

  private void copyDtoFieldsToTranslator(final TranslatorDTOCommonFields dto, final Translator translator) {
    translator.setIdentityNumber(dto.identityNumber());
    translator.setFirstName(dto.firstName());
    translator.setLastName(dto.lastName());
    translator.setEmail(dto.email());
    translator.setPhone(dto.phoneNumber());
    translator.setStreet(dto.street());
    translator.setTown(dto.town());
    translator.setPostalCode(dto.postalCode());
    translator.setCountry(dto.country());
    translator.setExtraInformation(dto.extraInformation());
    translator.setAssuranceGiven(dto.isAssuranceGiven());
  }

  private void assertCountryCode(final String countryCode, final APIExceptionType exceptionType) {
    if (countryCode != null && !countryService.containsKoodistoCode(countryCode)) {
      throw new APIException(exceptionType);
    }
  }

  @CacheEvict(cacheNames = CacheConfig.CACHE_NAME_PUBLIC_TRANSLATORS, allEntries = true)
  @Transactional
  public void deleteTranslator(final long translatorId) {
    final Translator translator = translatorRepository.getReferenceById(translatorId);
    final Collection<Authorisation> authorisations = translator.getAuthorisations();
    final List<AuthorisationTermReminder> reminders = authorisations
      .stream()
      .flatMap(t -> t.getReminders().stream())
      .toList();

    authorisationTermReminderRepository.deleteAllInBatch(reminders);
    authorisationRepository.deleteAllInBatch(authorisations);
    translatorRepository.deleteAllInBatch(List.of(translator));

    auditService.logById(AkrOperation.DELETE_TRANSLATOR, translatorId);
  }

  @CacheEvict(cacheNames = CacheConfig.CACHE_NAME_PUBLIC_TRANSLATORS, allEntries = true)
  @Transactional
  public ClerkTranslatorDTO createAuthorisation(final long translatorId, final AuthorisationCreateDTO dto) {
    final Translator translator = translatorRepository.getReferenceById(translatorId);
    final Map<LocalDate, MeetingDate> meetingDates = getLocalDateMeetingDateMap();
    final Map<LocalDate, ExaminationDate> examinationDates = getLocalDateExaminationDateMap();

    final Authorisation authorisation = createAuthorisation(translator, meetingDates, examinationDates, dto);

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logAuthorisation(AkrOperation.CREATE_AUTHORISATION, translator, authorisation.getId());
    return result;
  }

  private Authorisation createAuthorisation(
    final Translator translator,
    final Map<LocalDate, MeetingDate> meetingDates,
    final Map<LocalDate, ExaminationDate> examinationDates,
    final AuthorisationCreateDTO dto
  ) {
    final Authorisation authorisation = new Authorisation();
    translator.getAuthorisations().add(authorisation);
    authorisation.setTranslator(translator);

    copyDtoFieldsToAuthorisation(dto, authorisation, meetingDates, examinationDates);
    authorisationRepository.saveAndFlush(authorisation);

    return authorisation;
  }

  @CacheEvict(cacheNames = CacheConfig.CACHE_NAME_PUBLIC_TRANSLATORS, allEntries = true)
  @Transactional
  public ClerkTranslatorDTO updateAuthorisation(final AuthorisationUpdateDTO dto) {
    final Authorisation authorisation = authorisationRepository.getReferenceById(dto.id());
    authorisation.assertVersion(dto.version());

    final Map<LocalDate, MeetingDate> meetingDates = getLocalDateMeetingDateMap();
    final Map<LocalDate, ExaminationDate> examinationDates = getLocalDateExaminationDateMap();

    copyDtoFieldsToAuthorisation(dto, authorisation, meetingDates, examinationDates);
    authorisationRepository.flush();

    final Translator translator = authorisation.getTranslator();

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logAuthorisation(AkrOperation.UPDATE_AUTHORISATION, translator, authorisation.getId());
    return result;
  }

  private void copyDtoFieldsToAuthorisation(
    final AuthorisationDTOCommonFields dto,
    final Authorisation authorisation,
    final Map<LocalDate, MeetingDate> meetingDates,
    final Map<LocalDate, ExaminationDate> examinationDates
  ) {
    final MeetingDate meetingDate = meetingDates.get(dto.termBeginDate());
    if (meetingDate == null) {
      throw new APIException(APIExceptionType.AUTHORISATION_MISSING_MEETING_DATE);
    }

    final ExaminationDate examinationDate = examinationDates.get(dto.examinationDate());
    if (dto.examinationDate() != null && examinationDate == null) {
      throw new APIException(APIExceptionType.AUTHORISATION_MISSING_EXAMINATION_DATE);
    }

    authorisation.setBasis(dto.basis());
    authorisation.setFromLang(dto.from());
    authorisation.setToLang(dto.to());
    authorisation.setTermBeginDate(dto.termBeginDate());
    authorisation.setTermEndDate(dto.termEndDate());
    authorisation.setPermissionToPublish(dto.permissionToPublish());
    authorisation.setDiaryNumber(dto.diaryNumber());
    authorisation.setMeetingDate(meetingDate);
    authorisation.setExaminationDate(examinationDate);

    if (!authorisation.isBasisAndExaminationDateConsistent()) {
      throw new APIException(APIExceptionType.AUTHORISATION_BASIS_AND_EXAMINATION_DATE_MISMATCH);
    }
  }

  @CacheEvict(cacheNames = CacheConfig.CACHE_NAME_PUBLIC_TRANSLATORS, allEntries = true)
  @Transactional
  public ClerkTranslatorDTO updateAuthorisationPublishPermission(final AuthorisationPublishPermissionDTO dto) {
    final Authorisation authorisation = authorisationRepository.getReferenceById(dto.id());
    authorisation.assertVersion(dto.version());
    authorisation.setPermissionToPublish(dto.permissionToPublish());

    authorisationRepository.flush();

    final Translator translator = authorisation.getTranslator();

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logAuthorisation(
      AkrOperation.UPDATE_AUTHORISATION_PUBLISH_PERMISSION,
      translator,
      authorisation.getId()
    );
    return result;
  }

  @CacheEvict(cacheNames = CacheConfig.CACHE_NAME_PUBLIC_TRANSLATORS, allEntries = true)
  @Transactional
  public ClerkTranslatorDTO deleteAuthorisation(final long authorisationId) {
    final Authorisation authorisation = authorisationRepository.getReferenceById(authorisationId);
    final Translator translator = authorisation.getTranslator();
    if (translator.getAuthorisations().size() == 1) {
      throw new APIException(APIExceptionType.AUTHORISATION_DELETE_LAST_AUTHORISATION);
    }
    final Collection<AuthorisationTermReminder> reminders = authorisation.getReminders();

    authorisationTermReminderRepository.deleteAllInBatch(reminders);
    authorisationRepository.deleteAllInBatch(List.of(authorisation));

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logAuthorisation(AkrOperation.DELETE_AUTHORISATION, translator, authorisationId);
    return result;
  }

  private Map<LocalDate, MeetingDate> getLocalDateMeetingDateMap() {
    return meetingDateRepository
      .findAll()
      .stream()
      .collect(Collectors.toMap(MeetingDate::getDate, Function.identity()));
  }

  private Map<LocalDate, ExaminationDate> getLocalDateExaminationDateMap() {
    return examinationDateRepository
      .findAll()
      .stream()
      .collect(Collectors.toMap(ExaminationDate::getDate, Function.identity()));
  }
}
