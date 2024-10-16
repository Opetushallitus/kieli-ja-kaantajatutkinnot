package fi.oph.akr.service;

import fi.oph.akr.api.dto.LanguagePairDTO;
import fi.oph.akr.api.dto.LanguagePairsDictDTO;
import fi.oph.akr.api.dto.clerk.AuthorisationDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorAddressDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorAuthorisationsDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorResponseDTO;
import fi.oph.akr.api.dto.clerk.ExaminationDateDTO;
import fi.oph.akr.api.dto.clerk.MeetingDateDTO;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationCreateDTO;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationDTOCommonFields;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationUpdateDTO;
import fi.oph.akr.api.dto.clerk.modify.TranslatorCreateDTO;
import fi.oph.akr.api.dto.clerk.modify.TranslatorDTOCommonFields;
import fi.oph.akr.api.dto.clerk.modify.TranslatorUpdateDTO;
import fi.oph.akr.api.dto.translator.TranslatorAddressDTO;
import fi.oph.akr.audit.AkrOperation;
import fi.oph.akr.audit.AuditService;
import fi.oph.akr.audit.dto.AuthorisationAuditDTO;
import fi.oph.akr.audit.dto.ClerkTranslatorAuditDTO;
import fi.oph.akr.config.CacheConfig;
import fi.oph.akr.model.Authorisation;
import fi.oph.akr.model.AuthorisationTermReminder;
import fi.oph.akr.model.ExaminationDate;
import fi.oph.akr.model.MeetingDate;
import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.ContactDetailsUtil;
import fi.oph.akr.onr.OnrService;
import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.model.PersonalData;
import fi.oph.akr.repository.AuthorisationProjection;
import fi.oph.akr.repository.AuthorisationRepository;
import fi.oph.akr.repository.AuthorisationTermReminderRepository;
import fi.oph.akr.repository.ExaminationDateRepository;
import fi.oph.akr.repository.MeetingDateRepository;
import fi.oph.akr.repository.TranslatorRepository;
import fi.oph.akr.util.AuthorisationUtil;
import fi.oph.akr.util.exception.APIException;
import fi.oph.akr.util.exception.APIExceptionType;
import fi.oph.akr.util.exception.NotFoundException;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkTranslatorService {

  private static final Logger LOG = LoggerFactory.getLogger(ClerkTranslatorService.class);

  private final AuthorisationRepository authorisationRepository;
  private final AuthorisationTermReminderRepository authorisationTermReminderRepository;
  private final ExaminationDateRepository examinationDateRepository;
  private final ExaminationDateService examinationDateService;
  private final MeetingDateRepository meetingDateRepository;
  private final MeetingDateService meetingDateService;
  private final TranslatorRepository translatorRepository;
  private final AuditService auditService;
  private final OnrService onrService;

  @Transactional(readOnly = true)
  public ClerkTranslatorResponseDTO listTranslators() {
    final ClerkTranslatorResponseDTO result = listTranslatorsWithoutAudit();
    auditService.logOperation(AkrOperation.LIST_TRANSLATORS);
    return result;
  }

  private ClerkTranslatorResponseDTO listTranslatorsWithoutAudit() {
    final List<Translator> translators = translatorRepository.findExistingTranslators();
    final Map<String, PersonalData> personalDatas = onrService.getCachedPersonalDatas();
    final Map<Long, List<AuthorisationProjection>> authorisationProjections = getAuthorisationProjections();

    final List<ClerkTranslatorDTO> clerkTranslatorDTOS = createClerkTranslatorDTOs(
      translators,
      personalDatas,
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
    final Map<String, PersonalData> personalDatas,
    final Map<Long, List<AuthorisationProjection>> authorisationProjectionsByTranslator
  ) {
    return translators
      .stream()
      .map(translator -> {
        final List<AuthorisationDTO> authorisationDTOS = createAuthorisationDTOs(
          authorisationProjectionsByTranslator.get(translator.getId())
        );
        final ClerkTranslatorAuthorisationsDTO translatorAuthorisationsDTO = splitAuthorisationDTOs(authorisationDTOS);
        final PersonalData personalData = personalDatas.get(translator.getOnrId());
        final List<ClerkTranslatorAddressDTO> clerkTranslatorAddressDTO = createTranslatorAddressDTO(
          personalData,
          translator
        );

        if (personalData == null) {
          LOG.error("Error fetching the translator from onr with onrId {}", translator.getOnrId());
          throw new APIException(APIExceptionType.TRANSLATOR_ONR_ID_NOT_FOUND);
        }

        return ClerkTranslatorDTO
          .builder()
          .id(translator.getId())
          .onrId(translator.getOnrId())
          .version(translator.getVersion())
          .isIndividualised(personalData.getIndividualised())
          .hasIndividualisedAddress(personalData.getHasIndividualisedAddress())
          .firstName(personalData.getFirstName())
          .lastName(personalData.getLastName())
          .nickName(personalData.getNickName())
          .identityNumber(personalData.getIdentityNumber())
          .email(personalData.getEmail())
          .phoneNumber(personalData.getPhoneNumber())
          .address(clerkTranslatorAddressDTO)
          .extraInformation(translator.getExtraInformation())
          .isAssuranceGiven(translator.isAssuranceGiven())
          .authorisations(translatorAuthorisationsDTO)
          .build();
      })
      .toList();
  }

  private boolean isAddressSelected(final Translator translator, final TranslatorAddressDTO address) {
    return (
      address.source().toString().equals(translator.getSelectedSource()) &&
      address.type().toString().equals(translator.getSelectedType())
    );
  }

  private boolean isAddressAutomaticallySelected(final TranslatorAddressDTO address, final PersonalData personalData) {
    final TranslatorAddressDTO translatorAddressDTO = ContactDetailsUtil.findMostSuitableAddress(personalData);

    return (
      address.source().equals(translatorAddressDTO.source()) && address.type().equals(translatorAddressDTO.type())
    );
  }

  private List<ClerkTranslatorAddressDTO> createTranslatorAddressDTO(
    final PersonalData personalData,
    final Translator translator
  ) {
    return personalData
      .getAddress()
      .stream()
      .map(addr ->
        ClerkTranslatorAddressDTO
          .builder()
          .street(addr.street())
          .town(addr.town())
          .postalCode(addr.postalCode())
          .country(addr.country())
          .source(addr.source())
          .type(addr.type())
          .selected(isAddressSelected(translator, addr))
          .autoSelected(isAddressAutomaticallySelected(addr, personalData))
          .build()
      )
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

    final PersonalData personalData = createPersonalData(dto.onrId(), dto);
    validatePersonalData(personalData);

    if (personalData.getOnrId() == null) {
      final String onrId = onrService.insertPersonalData(personalData);
      translator.setOnrId(onrId);
    } else {
      onrService.updatePersonalData(personalData);
      translator.setOnrId(personalData.getOnrId());
    }

    copyDtoFieldsToTranslator(dto, translator);
    translatorRepository.saveAndFlush(translator);

    final Map<LocalDate, MeetingDate> meetingDates = getLocalDateMeetingDateMap();
    final Map<LocalDate, ExaminationDate> examinationDates = getLocalDateExaminationDateMap();

    dto
      .authorisations()
      .forEach(authDto -> {
        final Authorisation authorisation = createAuthorisation(translator, meetingDates, examinationDates, authDto);
        final AuthorisationAuditDTO authorisationAuditDTO = new AuthorisationAuditDTO(authorisation);
        auditService.logAuthorisation(
          AkrOperation.CREATE_AUTHORISATION,
          translator.getId(),
          authorisation.getId(),
          authorisationAuditDTO
        );
      });

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());

    try {
      final ClerkTranslatorAuditDTO auditDTO = new ClerkTranslatorAuditDTO(result);
      auditService.logCreate(AkrOperation.CREATE_TRANSLATOR, translator.getId(), auditDTO);
    } catch (final Exception e) {
      LOG.error("Failed to audit log create operation", e);
    }

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
    for (final ClerkTranslatorDTO t : listTranslatorsWithoutAudit().translators()) {
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

    final PersonalData oldPersonalData = onrService.getCachedPersonalDatas().get(translator.getOnrId());
    final PersonalData personalData = createPersonalData(translator.getOnrId(), dto);
    final ClerkTranslatorAuditDTO oldTranslatorDTO = new ClerkTranslatorAuditDTO(translator, oldPersonalData);

    validatePersonalData(personalData);
    onrService.updatePersonalData(personalData);

    copyDtoFieldsToTranslator(dto, translator);

    translatorRepository.flush();

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());

    try {
      final ClerkTranslatorAuditDTO newTranslator = new ClerkTranslatorAuditDTO(translator, personalData);
      auditService.logUpdate(AkrOperation.UPDATE_TRANSLATOR, translator.getId(), oldTranslatorDTO, newTranslator);
    } catch (final Exception e) {
      LOG.error("Failed to audit log update operation", e);
    }

    return result;
  }

  private void validatePersonalData(final PersonalData personalData) {
    if (!personalData.isOnrIdAndIndividualisedInformationConsistent()) {
      throw new APIException(APIExceptionType.TRANSLATOR_ONR_ID_AND_INDIVIDUALISED_MISMATCH);
    }
  }

  private PersonalData createPersonalData(final String onrId, final TranslatorDTOCommonFields dto) {
    return PersonalData
      .builder()
      .onrId(onrId)
      .individualised(dto.isIndividualised())
      .hasIndividualisedAddress(dto.hasIndividualisedAddress())
      .lastName(dto.lastName())
      .firstName(dto.firstName())
      .nickName(dto.nickName())
      .identityNumber(dto.identityNumber())
      .email(dto.email())
      .phoneNumber(dto.phoneNumber())
      .address(
        dto
          .address()
          .stream()
          .map(addr ->
            TranslatorAddressDTO
              .builder()
              .town(addr.town())
              .country(addr.country())
              .street(addr.street())
              .postalCode(addr.postalCode())
              .source(addr.source())
              .type(addr.type())
              .build()
          )
          .toList()
      )
      .build();
  }

  private void copyDtoFieldsToTranslator(final TranslatorDTOCommonFields dto, final Translator translator) {
    translator.setExtraInformation(dto.extraInformation());
    translator.setAssuranceGiven(dto.isAssuranceGiven());

    final Optional<ClerkTranslatorAddressDTO> selectedAddress = dto
      .address()
      .stream()
      .filter(ClerkTranslatorAddressDTO::selected)
      .findFirst();

    selectedAddress.ifPresent(clerkTranslatorAddressDTO -> {
      translator.setSelectedSource(clerkTranslatorAddressDTO.source().toString());
      translator.setSelectedType(clerkTranslatorAddressDTO.type().toString());
    });
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
    translatorRepository.deleteById(translatorId);

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
    final AuthorisationAuditDTO auditDTO = new AuthorisationAuditDTO(authorisation);
    auditService.logAuthorisation(
      AkrOperation.CREATE_AUTHORISATION,
      translator.getId(),
      authorisation.getId(),
      auditDTO
    );
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

    final AuthorisationAuditDTO oldAuthorisation = new AuthorisationAuditDTO(authorisation);

    final Map<LocalDate, MeetingDate> meetingDates = getLocalDateMeetingDateMap();
    final Map<LocalDate, ExaminationDate> examinationDates = getLocalDateExaminationDateMap();

    copyDtoFieldsToAuthorisation(dto, authorisation, meetingDates, examinationDates);
    authorisationRepository.flush();
    final AuthorisationAuditDTO newAuthorisation = new AuthorisationAuditDTO(authorisation);

    final Translator translator = authorisation.getTranslator();

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logAuthorisation(
      AkrOperation.UPDATE_AUTHORISATION,
      translator,
      authorisation.getId(),
      oldAuthorisation,
      newAuthorisation
    );
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
    if (!authorisation.isBasisAndTermEndDateConsistent()) {
      throw new APIException(APIExceptionType.AUTHORISATION_BASIS_AND_TERM_END_DATE_MISMATCH);
    }
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
    authorisationRepository.deleteById(authorisationId);

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

  public List<ClerkTranslatorDTO> listTranslatorsBySource(final Optional<ContactDetailsGroupSource> source) {
    final List<Translator> translators = translatorRepository.findExistingTranslators();
    final Map<String, PersonalData> personalDatas = onrService.getCachedPersonalDatas();
    return translators
      .stream()
      .map(translator -> {
        final PersonalData personalData = personalDatas.get(translator.getOnrId());
        final List<ClerkTranslatorAddressDTO> clerkTranslatorAddressDTO = createTranslatorAddressDTO(
          personalData,
          translator
        );
        final TranslatorAddressDTO primaryAddress = ContactDetailsUtil.getPrimaryAddress(personalData, translator);

        if (source.isEmpty() && primaryAddress != null) {
          return null;
        }

        if (source.isPresent() && (primaryAddress == null || !primaryAddress.source().equals(source.get()))) {
          return null;
        }

        if (personalData == null) {
          LOG.error("Error fetching the translator from onr with onrId {}", translator.getOnrId());
          throw new APIException(APIExceptionType.TRANSLATOR_ONR_ID_NOT_FOUND);
        }

        return ClerkTranslatorDTO
          .builder()
          .id(translator.getId())
          .version(translator.getVersion())
          .isIndividualised(personalData.getIndividualised())
          .hasIndividualisedAddress(personalData.getHasIndividualisedAddress())
          .firstName(personalData.getFirstName())
          .lastName(personalData.getLastName())
          .nickName(personalData.getNickName())
          .identityNumber(personalData.getIdentityNumber())
          .email(personalData.getEmail())
          .phoneNumber(personalData.getPhoneNumber())
          .address(clerkTranslatorAddressDTO)
          .extraInformation(translator.getExtraInformation())
          .isAssuranceGiven(translator.isAssuranceGiven())
          .authorisations(
            ClerkTranslatorAuthorisationsDTO
              .builder()
              .effective(List.of())
              .expired(List.of())
              .expiring(List.of())
              .expiredDeduplicated(List.of())
              .formerVir(List.of())
              .build()
          )
          .build();
      })
      .filter(Objects::nonNull)
      .toList();
  }
}
