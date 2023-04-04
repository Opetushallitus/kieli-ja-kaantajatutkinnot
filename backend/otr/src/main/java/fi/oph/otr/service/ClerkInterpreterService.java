package fi.oph.otr.service;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTO;
import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTOCommonFields;
import fi.oph.otr.api.dto.clerk.ClerkInterpreterQualificationsDTO;
import fi.oph.otr.api.dto.clerk.ClerkQualificationDTO;
import fi.oph.otr.api.dto.clerk.ClerkQualificationDTOCommonFields;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterUpdateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkQualificationCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkQualificationUpdateDTO;
import fi.oph.otr.audit.AuditService;
import fi.oph.otr.audit.OtrOperation;
import fi.oph.otr.model.BaseEntity;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.MeetingDate;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.model.Region;
import fi.oph.otr.onr.OnrService;
import fi.oph.otr.onr.model.PersonalData;
import fi.oph.otr.repository.InterpreterRegionProjection;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.MeetingDateRepository;
import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.repository.RegionRepository;
import fi.oph.otr.util.QualificationUtil;
import fi.oph.otr.util.exception.APIException;
import fi.oph.otr.util.exception.APIExceptionType;
import fi.oph.otr.util.exception.NotFoundException;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkInterpreterService {

  @Resource
  private final InterpreterRepository interpreterRepository;

  @Resource
  private final MeetingDateRepository meetingDateRepository;

  @Resource
  private final QualificationRepository qualificationRepository;

  @Resource
  private final RegionRepository regionRepository;

  @Resource
  private final RegionService regionService;

  @Resource
  private final LanguageService languageService;

  @Resource
  private final OnrService onrService;

  @Resource
  private final AuditService auditService;

  @Transactional(readOnly = true)
  public List<ClerkInterpreterDTO> list() {
    final List<ClerkInterpreterDTO> result = listWithoutAudit();
    auditService.logOperation(OtrOperation.LIST_INTERPRETERS);
    return result;
  }

  private List<ClerkInterpreterDTO> listWithoutAudit() {
    final Map<Long, List<InterpreterRegionProjection>> interpreterRegionProjections = regionRepository
      .listInterpreterRegionProjections()
      .stream()
      .collect(Collectors.groupingBy(InterpreterRegionProjection::interpreterId));

    final Map<Long, List<Qualification>> interpreterQualifications = qualificationRepository
      .findExistingQualifications()
      .stream()
      .collect(Collectors.groupingBy(q -> q.getInterpreter().getId()));

    final List<Interpreter> interpreters = interpreterRepository.findExistingInterpreters();
    final Map<String, PersonalData> personalDatas = onrService.getCachedPersonalDatas();

    return interpreters
      .stream()
      .map(interpreter -> {
        final PersonalData personalData = personalDatas.get(interpreter.getOnrId());
        final List<Qualification> qualifications = interpreterQualifications.getOrDefault(
          interpreter.getId(),
          Collections.emptyList()
        );
        final List<InterpreterRegionProjection> regionProjections = interpreterRegionProjections.getOrDefault(
          interpreter.getId(),
          Collections.emptyList()
        );

        return createClerkInterpreterDTO(interpreter, personalData, qualifications, regionProjections);
      })
      .sorted(Comparator.comparing(ClerkInterpreterDTO::lastName).thenComparing(ClerkInterpreterDTO::nickName))
      .toList();
  }

  private ClerkInterpreterDTO createClerkInterpreterDTO(
    final Interpreter interpreter,
    final PersonalData personalData,
    final List<Qualification> qualifications,
    final List<InterpreterRegionProjection> regionProjections
  ) {
    final List<String> regions = regionProjections.stream().map(InterpreterRegionProjection::code).toList();

    final List<ClerkQualificationDTO> qualificationDTOs = qualifications
      .stream()
      .map(this::createQualificationDTO)
      .sorted(
        // Comparing by id used to preserve ordering of qualifications in UI on interpreter qualification updates
        Comparator.comparing(ClerkQualificationDTO::beginDate).thenComparing(ClerkQualificationDTO::id).reversed()
      )
      .toList();
    final ClerkInterpreterQualificationsDTO interpreterQualificationsDTO = splitQualificationDTOs(qualificationDTOs);

    return ClerkInterpreterDTO
      .builder()
      .id(interpreter.getId())
      .version(interpreter.getVersion())
      .isIndividualised(personalData.getIndividualised())
      .hasIndividualisedAddress(personalData.getHasIndividualisedAddress())
      .identityNumber(personalData.getIdentityNumber())
      .lastName(personalData.getLastName())
      .firstName(personalData.getFirstName())
      .nickName(personalData.getNickName())
      .email(personalData.getEmail())
      .permissionToPublishEmail(interpreter.isPermissionToPublishEmail())
      .phoneNumber(personalData.getPhoneNumber())
      .permissionToPublishPhone(interpreter.isPermissionToPublishPhone())
      .otherContactInfo(interpreter.getOtherContactInformation())
      .permissionToPublishOtherContactInfo(interpreter.isPermissionToPublishOtherContactInfo())
      .street(personalData.getStreet())
      .postalCode(personalData.getPostalCode())
      .town(personalData.getTown())
      .country(personalData.getCountry())
      .extraInformation(interpreter.getExtraInformation())
      .regions(regions)
      .qualifications(interpreterQualificationsDTO)
      .build();
  }

  private ClerkQualificationDTO createQualificationDTO(final Qualification qualification) {
    return ClerkQualificationDTO
      .builder()
      .id(qualification.getId())
      .version(qualification.getVersion())
      .fromLang(qualification.getFromLang())
      .toLang(qualification.getToLang())
      .beginDate(qualification.getBeginDate())
      .endDate(qualification.getEndDate())
      .examinationType(qualification.getExaminationType())
      .permissionToPublish(qualification.isPermissionToPublish())
      .diaryNumber(qualification.getDiaryNumber())
      .build();
  }

  private ClerkInterpreterQualificationsDTO splitQualificationDTOs(
    final List<ClerkQualificationDTO> qualificationDTOs
  ) {
    final List<ClerkQualificationDTO> effective = QualificationUtil.filterEffectiveQualifications(qualificationDTOs);
    final List<ClerkQualificationDTO> expiring = QualificationUtil.filterExpiringQualifications(qualificationDTOs);
    final List<ClerkQualificationDTO> expired = QualificationUtil.filterExpiredQualifications(qualificationDTOs);
    final List<ClerkQualificationDTO> expiredDeduplicated = QualificationUtil.filterExpiredDeduplicates(
      expired,
      effective
    );

    return ClerkInterpreterQualificationsDTO
      .builder()
      .effective(effective)
      .expiring(expiring)
      .expired(expired)
      .expiredDeduplicated(expiredDeduplicated)
      .build();
  }

  @Transactional
  public ClerkInterpreterDTO createInterpreter(final ClerkInterpreterCreateDTO dto) throws Exception {
    validateRegions(dto);

    final Map<LocalDate, MeetingDate> meetingDates = getLocalDateMeetingDateMap();

    dto.qualifications().forEach(qualificationDTO -> validateQualification(meetingDates, qualificationDTO));

    final Interpreter interpreter = new Interpreter();
    final PersonalData personalData = createPersonalData(dto.onrId(), dto);
    validatePersonalData(personalData);

    if (personalData.getOnrId() == null) {
      final String onrId = onrService.insertPersonalData(personalData);
      interpreter.setOnrId(onrId);
    } else {
      onrService.updatePersonalData(personalData);
      interpreter.setOnrId(personalData.getOnrId());
    }

    copyFromInterpreterDTO(interpreter, dto);
    interpreterRepository.save(interpreter);
    regionRepository.saveAllAndFlush(interpreter.getRegions());

    dto
      .qualifications()
      .forEach(qualificationCreateDTO -> createQualification(interpreter, meetingDates, qualificationCreateDTO));

    interpreterRepository.saveAndFlush(interpreter);

    final ClerkInterpreterDTO result = getInterpreterWithoutAudit(interpreter.getId());
    auditService.logById(OtrOperation.CREATE_INTERPRETER, interpreter.getId());
    return result;
  }

  private void validateRegions(final ClerkInterpreterDTOCommonFields dto) {
    dto
      .regions()
      .forEach(regionCode -> {
        if (!regionService.containsKoodistoCode(regionCode)) {
          throw new APIException(APIExceptionType.INTERPRETER_REGION_UNKNOWN);
        }
      });
  }

  private void validateQualification(
    final Map<LocalDate, MeetingDate> meetingDates,
    final ClerkQualificationDTOCommonFields dto
  ) {
    Stream
      .of(dto.fromLang(), dto.toLang())
      .forEach(languageCode -> {
        if (!languageService.containsKoodistoCode(languageCode)) {
          throw new APIException(APIExceptionType.QUALIFICATION_LANGUAGE_UNKNOWN);
        }
      });

    if (!dto.endDate().isAfter(dto.beginDate())) {
      throw new APIException(APIExceptionType.QUALIFICATION_INVALID_TERM);
    }

    final MeetingDate meetingDate = meetingDates.get(dto.beginDate());
    if (meetingDate == null) {
      throw new APIException(APIExceptionType.QUALIFICATION_MISSING_MEETING_DATE);
    }
  }

  private PersonalData createPersonalData(final String onrId, final ClerkInterpreterDTOCommonFields dto) {
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
      .street(dto.street())
      .postalCode(dto.postalCode())
      .town(dto.town())
      .country(dto.country())
      .build();
  }

  private void validatePersonalData(final PersonalData personalData) {
    final String[] firstNames = personalData.getFirstName().split(" ");

    if (Arrays.stream(firstNames).noneMatch(name -> name.equals(personalData.getNickName()))) {
      throw new APIException(APIExceptionType.INTERPRETER_INVALID_NICK_NAME);
    }

    if (!personalData.isOnrIdAndIndividualisedInformationConsistent()) {
      throw new APIException(APIExceptionType.INTERPRETER_ONR_ID_AND_INDIVIDUALISED_MISMATCH);
    }
  }

  private void copyFromInterpreterDTO(final Interpreter interpreter, final ClerkInterpreterDTOCommonFields dto) {
    interpreter.setPermissionToPublishEmail(dto.permissionToPublishEmail());
    interpreter.setPermissionToPublishPhone(dto.permissionToPublishPhone());
    interpreter.setOtherContactInformation(dto.otherContactInfo());
    interpreter.setPermissionToPublishOtherContactInfo(dto.permissionToPublishOtherContactInfo());
    interpreter.setExtraInformation(dto.extraInformation());

    final List<Region> regions = dto
      .regions()
      .stream()
      .distinct()
      .map(regionCode -> {
        final Region region = new Region();
        region.setInterpreter(interpreter);
        region.setCode(regionCode);
        return region;
      })
      .toList();

    interpreter.getRegions().addAll(regions);
  }

  private Qualification createQualification(
    final Interpreter interpreter,
    final Map<LocalDate, MeetingDate> meetingDates,
    final ClerkQualificationCreateDTO dto
  ) {
    final Qualification qualification = new Qualification();
    interpreter.getQualifications().add(qualification);
    qualification.setInterpreter(interpreter);

    copyFromQualificationDTO(qualification, meetingDates, dto);
    return qualificationRepository.saveAndFlush(qualification);
  }

  private void copyFromQualificationDTO(
    final Qualification qualification,
    final Map<LocalDate, MeetingDate> meetingDates,
    final ClerkQualificationDTOCommonFields dto
  ) {
    qualification.setFromLang(dto.fromLang());
    qualification.setToLang(dto.toLang());
    qualification.setBeginDate(dto.beginDate());
    qualification.setEndDate(dto.endDate());
    qualification.setExaminationType(dto.examinationType());
    qualification.setPermissionToPublish(dto.permissionToPublish());
    qualification.setDiaryNumber(dto.diaryNumber());

    final MeetingDate meetingDate = meetingDates.get(dto.beginDate());
    qualification.setMeetingDate(meetingDate);
  }

  @Transactional(readOnly = true)
  public ClerkInterpreterDTO getInterpreter(final long interpreterId) {
    final ClerkInterpreterDTO result = getInterpreterWithoutAudit(interpreterId);
    auditService.logById(OtrOperation.GET_INTERPRETER, interpreterId);
    return result;
  }

  private ClerkInterpreterDTO getInterpreterWithoutAudit(final long interpreterId) {
    // This could be optimized, by fetching only one interpreter and it's data, but is it worth of the programming work?
    for (ClerkInterpreterDTO i : listWithoutAudit()) {
      if (i.id() == interpreterId) {
        return i;
      }
    }
    throw new NotFoundException(String.format("Interpreter with id: %d not found", interpreterId));
  }

  @Transactional
  public ClerkInterpreterDTO updateInterpreter(final ClerkInterpreterUpdateDTO dto) throws Exception {
    validateRegions(dto);

    final Interpreter interpreter = interpreterRepository.getReferenceById(dto.id());
    interpreter.assertVersion(dto.version());

    final PersonalData personalData = createPersonalData(interpreter.getOnrId(), dto);
    validatePersonalData(personalData);
    onrService.updatePersonalData(personalData);

    final List<Region> regionsToDelete = new ArrayList<>(interpreter.getRegions());
    interpreter.getRegions().removeAll(regionsToDelete);
    regionRepository.deleteAllInBatch(regionsToDelete);

    copyFromInterpreterDTO(interpreter, dto);
    regionRepository.saveAll(interpreter.getRegions());
    interpreterRepository.saveAndFlush(interpreter);

    final ClerkInterpreterDTO result = getInterpreterWithoutAudit(interpreter.getId());
    auditService.logById(OtrOperation.UPDATE_INTERPRETER, interpreter.getId());
    return result;
  }

  @Transactional
  public void deleteInterpreter(final long id) {
    final Interpreter interpreter = interpreterRepository.getReferenceById(id);
    interpreter.markDeleted();
    interpreter.getQualifications().forEach(BaseEntity::markDeleted);

    auditService.logById(OtrOperation.DELETE_INTERPRETER, id);
  }

  @Transactional
  public ClerkInterpreterDTO createQualification(final long interpreterId, final ClerkQualificationCreateDTO dto) {
    final Map<LocalDate, MeetingDate> meetingDates = getLocalDateMeetingDateMap();

    validateQualification(meetingDates, dto);

    final Interpreter interpreter = interpreterRepository.getReferenceById(interpreterId);

    final Qualification qualification = createQualification(interpreter, meetingDates, dto);
    interpreterRepository.saveAndFlush(interpreter);

    final ClerkInterpreterDTO result = getInterpreterWithoutAudit(interpreter.getId());
    auditService.logQualification(OtrOperation.CREATE_QUALIFICATION, interpreter, qualification.getId());
    return result;
  }

  @Transactional
  public ClerkInterpreterDTO updateQualification(final ClerkQualificationUpdateDTO dto) {
    final Map<LocalDate, MeetingDate> meetingDates = getLocalDateMeetingDateMap();
    validateQualification(meetingDates, dto);

    final Qualification qualification = qualificationRepository.getReferenceById(dto.id());
    qualification.assertVersion(dto.version());

    copyFromQualificationDTO(qualification, meetingDates, dto);
    qualificationRepository.saveAndFlush(qualification);

    final Interpreter interpreter = qualification.getInterpreter();

    final ClerkInterpreterDTO result = getInterpreterWithoutAudit(interpreter.getId());
    auditService.logQualification(OtrOperation.UPDATE_QUALIFICATION, interpreter, qualification.getId());
    return result;
  }

  @Transactional
  public ClerkInterpreterDTO deleteQualification(final long qualificationId) {
    final Qualification qualification = qualificationRepository.getReferenceById(qualificationId);
    final Interpreter interpreter = qualification.getInterpreter();
    if (interpreter.getQualifications().stream().filter(q -> !q.isDeleted()).toList().size() == 1) {
      throw new APIException(APIExceptionType.QUALIFICATION_DELETE_LAST_QUALIFICATION);
    }

    qualification.markDeleted();

    final ClerkInterpreterDTO result = getInterpreterWithoutAudit(interpreter.getId());
    auditService.logQualification(OtrOperation.DELETE_QUALIFICATION, interpreter, qualificationId);
    return result;
  }

  private Map<LocalDate, MeetingDate> getLocalDateMeetingDateMap() {
    return meetingDateRepository
      .findAll()
      .stream()
      .collect(Collectors.toMap(MeetingDate::getDate, Function.identity()));
  }
}
