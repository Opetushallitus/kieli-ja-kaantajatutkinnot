package fi.oph.akt.service;

import fi.oph.akt.api.dto.LanguagePairDTO;
import fi.oph.akt.api.dto.LanguagePairsDictDTO;
import fi.oph.akt.api.dto.clerk.AuthorisationDTO;
import fi.oph.akt.api.dto.clerk.ClerkTranslatorDTO;
import fi.oph.akt.api.dto.clerk.ClerkTranslatorResponseDTO;
import fi.oph.akt.api.dto.clerk.MeetingDateDTO;
import fi.oph.akt.api.dto.clerk.modify.AuthorisationCreateDTO;
import fi.oph.akt.api.dto.clerk.modify.AuthorisationDTOCommonFields;
import fi.oph.akt.api.dto.clerk.modify.AuthorisationPublishPermissionDTO;
import fi.oph.akt.api.dto.clerk.modify.AuthorisationUpdateDTO;
import fi.oph.akt.api.dto.clerk.modify.TranslatorCreateDTO;
import fi.oph.akt.api.dto.clerk.modify.TranslatorDTOCommonFields;
import fi.oph.akt.api.dto.clerk.modify.TranslatorUpdateDTO;
import fi.oph.akt.audit.AktOperation;
import fi.oph.akt.audit.AuditService;
import fi.oph.akt.model.Authorisation;
import fi.oph.akt.model.AuthorisationTermReminder;
import fi.oph.akt.model.MeetingDate;
import fi.oph.akt.model.Translator;
import fi.oph.akt.repository.AuthorisationProjection;
import fi.oph.akt.repository.AuthorisationRepository;
import fi.oph.akt.repository.AuthorisationTermReminderRepository;
import fi.oph.akt.repository.MeetingDateRepository;
import fi.oph.akt.repository.TranslatorRepository;
import fi.oph.akt.util.AuthorisationProjectionComparator;
import fi.oph.akt.util.exception.APIException;
import fi.oph.akt.util.exception.APIExceptionType;
import fi.oph.akt.util.exception.DataIntegrityViolationExceptionUtil;
import fi.oph.akt.util.exception.NotFoundException;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkTranslatorService {

  private static final AuthorisationProjectionComparator AUTHORISATION_PROJECTION_COMPARATOR = new AuthorisationProjectionComparator();

  @Resource
  private final AuthorisationRepository authorisationRepository;

  @Resource
  private final AuthorisationTermReminderRepository authorisationTermReminderRepository;

  @Resource
  private final MeetingDateService meetingDateService;

  @Resource
  private final MeetingDateRepository meetingDateRepository;

  @Resource
  private final TranslatorRepository translatorRepository;

  @Resource
  private final AuditService auditService;

  @Transactional(readOnly = true)
  public ClerkTranslatorResponseDTO listTranslators() {
    final ClerkTranslatorResponseDTO result = listTranslatorsWithoutAudit();
    auditService.logOperation(AktOperation.LIST_TRANSLATORS);
    return result;
  }

  private ClerkTranslatorResponseDTO listTranslatorsWithoutAudit() {
    final List<Translator> translators = translatorRepository.findAll();
    final Map<Long, List<AuthorisationProjection>> authorisationProjections = getAuthorisationProjections();

    final List<ClerkTranslatorDTO> clerkTranslatorDTOS = createClerkTranslatorDTOs(
      translators,
      authorisationProjections
    );
    final LanguagePairsDictDTO languagePairsDictDTO = getLanguagePairsDictDTO();
    final List<String> towns = getDistinctTowns(translators);
    final List<MeetingDateDTO> meetingDateDTOS = meetingDateService.listMeetingDatesWithoutAudit();

    return ClerkTranslatorResponseDTO
      .builder()
      .translators(clerkTranslatorDTOS)
      .langs(languagePairsDictDTO)
      .towns(towns)
      .meetingDates(meetingDateDTOS)
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
          .authorisations(authorisationDTOS)
          .build();
      })
      .toList();
  }

  private List<AuthorisationDTO> createAuthorisationDTOs(final List<AuthorisationProjection> authorisationProjections) {
    return authorisationProjections
      .stream()
      .sorted(AUTHORISATION_PROJECTION_COMPARATOR.reversed())
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
          .autDate(authProjection.autDate())
          .build();
      })
      .toList();
  }

  private LanguagePairsDictDTO getLanguagePairsDictDTO() {
    final List<String> fromLangs = authorisationRepository.getDistinctFromLangs();
    final List<String> toLangs = authorisationRepository.getDistinctToLangs();

    return LanguagePairsDictDTO.builder().from(fromLangs).to(toLangs).build();
  }

  private List<String> getDistinctTowns(final Collection<Translator> translators) {
    return translators.stream().map(Translator::getTown).filter(Objects::nonNull).distinct().sorted().toList();
  }

  @Transactional
  public ClerkTranslatorDTO createTranslator(final TranslatorCreateDTO dto) {
    final Translator translator = new Translator();
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
    dto.authorisations().forEach(authDto -> createAuthorisation(translator, meetingDates, authDto));

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logById(AktOperation.CREATE_TRANSLATOR, translator.getId());
    return result;
  }

  @Transactional(readOnly = true)
  public ClerkTranslatorDTO getTranslator(final long translatorId) {
    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translatorId);
    auditService.logById(AktOperation.GET_TRANSLATOR, translatorId);
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

  @Transactional
  public ClerkTranslatorDTO updateTranslator(final TranslatorUpdateDTO dto) {
    final Translator translator = translatorRepository.getById(dto.id());
    translator.assertVersion(dto.version());
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
    auditService.logById(AktOperation.UPDATE_TRANSLATOR, translator.getId());
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

  @Transactional
  public void deleteTranslator(final long translatorId) {
    final Translator translator = translatorRepository.getById(translatorId);
    final Collection<Authorisation> authorisations = translator.getAuthorisations();
    final List<AuthorisationTermReminder> reminders = authorisations
      .stream()
      .flatMap(t -> t.getReminders().stream())
      .toList();

    authorisationTermReminderRepository.deleteAllInBatch(reminders);
    authorisationRepository.deleteAllInBatch(authorisations);
    translatorRepository.deleteAllInBatch(List.of(translator));

    auditService.logById(AktOperation.DELETE_TRANSLATOR, translatorId);
  }

  @Transactional
  public ClerkTranslatorDTO createAuthorisation(final long translatorId, final AuthorisationCreateDTO dto) {
    final Translator translator = translatorRepository.getById(translatorId);
    final Map<LocalDate, MeetingDate> meetingDates = getLocalDateMeetingDateMap();
    final Authorisation authorisation = createAuthorisation(translator, meetingDates, dto);

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logAuthorisation(AktOperation.CREATE_AUTHORISATION, translator, authorisation.getId());
    return result;
  }

  private Authorisation createAuthorisation(
    final Translator translator,
    final Map<LocalDate, MeetingDate> meetingDates,
    final AuthorisationCreateDTO dto
  ) {
    final Authorisation authorisation = new Authorisation();
    translator.getAuthorisations().add(authorisation);
    authorisation.setTranslator(translator);

    copyDtoFieldsToAuthorisation(dto, authorisation, meetingDates);
    authorisationRepository.saveAndFlush(authorisation);

    return authorisation;
  }

  @Transactional
  public ClerkTranslatorDTO updateAuthorisation(final AuthorisationUpdateDTO dto) {
    final Authorisation authorisation = authorisationRepository.getById(dto.id());
    authorisation.assertVersion(dto.version());

    final Map<LocalDate, MeetingDate> meetingDates = getLocalDateMeetingDateMap();
    copyDtoFieldsToAuthorisation(dto, authorisation, meetingDates);
    authorisationRepository.flush();

    final Translator translator = authorisation.getTranslator();

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logAuthorisation(AktOperation.UPDATE_AUTHORISATION, translator, authorisation.getId());
    return result;
  }

  private void copyDtoFieldsToAuthorisation(
    final AuthorisationDTOCommonFields dto,
    final Authorisation authorisation,
    final Map<LocalDate, MeetingDate> meetingDates
  ) {
    final MeetingDate meetingDate = meetingDates.get(dto.termBeginDate());
    if (meetingDate == null) {
      throw new APIException(APIExceptionType.AUTHORISATION_MISSING_MEETING_DATE);
    }

    authorisation.setBasis(dto.basis());
    authorisation.setFromLang(dto.from());
    authorisation.setToLang(dto.to());
    authorisation.setTermBeginDate(dto.termBeginDate());
    authorisation.setTermEndDate(dto.termEndDate());
    authorisation.setPermissionToPublish(dto.permissionToPublish());
    authorisation.setDiaryNumber(dto.diaryNumber());
    authorisation.setAutDate(dto.autDate());
    authorisation.setMeetingDate(meetingDate);

    if (!authorisation.isBasisAndAutDateConsistent()) {
      throw new APIException(APIExceptionType.AUTHORISATION_BASIS_AND_AUT_DATE_MISMATCH);
    }
  }

  @Transactional
  public ClerkTranslatorDTO updateAuthorisationPublishPermission(final AuthorisationPublishPermissionDTO dto) {
    final Authorisation authorisation = authorisationRepository.getById(dto.id());
    authorisation.assertVersion(dto.version());
    authorisation.setPermissionToPublish(dto.permissionToPublish());

    authorisationRepository.flush();

    final Translator translator = authorisation.getTranslator();

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logAuthorisation(
      AktOperation.UPDATE_AUTHORISATION_PUBLISH_PERMISSION,
      translator,
      authorisation.getId()
    );
    return result;
  }

  @Transactional
  public ClerkTranslatorDTO deleteAuthorisation(final long authorisationId) {
    final Authorisation authorisation = authorisationRepository.getById(authorisationId);
    final Translator translator = authorisation.getTranslator();
    if (translator.getAuthorisations().size() == 1) {
      throw new APIException(APIExceptionType.AUTHORISATION_DELETE_LAST_AUTHORISATION);
    }
    final Collection<AuthorisationTermReminder> reminders = authorisation.getReminders();

    authorisationTermReminderRepository.deleteAllInBatch(reminders);
    authorisationRepository.deleteAllInBatch(List.of(authorisation));

    final ClerkTranslatorDTO result = getTranslatorWithoutAudit(translator.getId());
    auditService.logAuthorisation(AktOperation.DELETE_AUTHORISATION, translator, authorisationId);
    return result;
  }

  private Map<LocalDate, MeetingDate> getLocalDateMeetingDateMap() {
    return meetingDateRepository
      .findAll()
      .stream()
      .collect(Collectors.toMap(MeetingDate::getDate, Function.identity()));
  }
}
