package fi.oph.otr.service;

import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTO;
import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTOCommonFields;
import fi.oph.otr.api.dto.clerk.ClerkQualificationDTO;
import fi.oph.otr.api.dto.clerk.ClerkQualificationDTOCommonFields;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterUpdateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkQualificationCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkQualificationUpdateDTO;
import fi.oph.otr.model.BaseEntity;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.model.Region;
import fi.oph.otr.repository.InterpreterRegionProjection;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.repository.RegionRepository;
import fi.oph.otr.util.exception.APIException;
import fi.oph.otr.util.exception.APIExceptionType;
import fi.oph.otr.util.exception.NotFoundException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkInterpreterService {

  @Resource
  private final InterpreterRepository interpreterRepository;

  @Resource
  private final QualificationRepository qualificationRepository;

  @Resource
  private final RegionRepository regionRepository;

  @Resource
  private final RegionService regionService;

  @Resource
  private final LanguageService languageService;

  @Transactional(readOnly = true)
  public List<ClerkInterpreterDTO> list() {
    final Map<Long, List<InterpreterRegionProjection>> interpreterRegionProjections = regionRepository
      .listInterpreterRegionProjections()
      .stream()
      .collect(Collectors.groupingBy(InterpreterRegionProjection::interpreterId));

    final Map<Long, List<Qualification>> interpreterQualifications = qualificationRepository
      .findAll()
      .stream()
      .collect(Collectors.groupingBy(q -> q.getInterpreter().getId()));

    return interpreterRepository
      .findAll()
      .stream()
      .map(interpreter -> {
        final List<Qualification> qualifications = interpreterQualifications.get(interpreter.getId());

        final List<InterpreterRegionProjection> regionProjections = interpreterRegionProjections.getOrDefault(
          interpreter.getId(),
          Collections.emptyList()
        );

        return createClerkInterpreterDTO(interpreter, qualifications, regionProjections);
      })
      .toList();
  }

  private ClerkInterpreterDTO createClerkInterpreterDTO(
    final Interpreter interpreter,
    final List<Qualification> qualifications,
    final List<InterpreterRegionProjection> regionProjections
  ) {
    final List<ClerkQualificationDTO> qualificationDTOs = qualifications
      .stream()
      .map(this::createQualificationDTO)
      .toList();

    final List<String> regions = regionProjections.stream().map(InterpreterRegionProjection::code).toList();

    // FIXME fetch details from onr
    return ClerkInterpreterDTO
      .builder()
      .id(interpreter.getId())
      .version(interpreter.getVersion())
      .deleted(interpreter.isDeleted())
      .identityNumber("TODO")
      .firstName("Etunimi:" + interpreter.getOnrId())
      .nickName("Kutsumanimi:" + interpreter.getOnrId())
      .lastName("Sukunimi:" + interpreter.getOnrId())
      .email("TODOfoo@bar.invalid")
      .permissionToPublishEmail(interpreter.isPermissionToPublishEmail())
      .phoneNumber(null)
      .permissionToPublishPhone(interpreter.isPermissionToPublishPhone())
      .otherContactInfo(interpreter.getOtherContactInformation())
      .permissionToPublishOtherContactInfo(interpreter.isPermissionToPublishOtherContactInfo())
      .street(null)
      .postalCode(null)
      .town(null)
      .extraInformation(interpreter.getExtraInformation())
      .regions(regions)
      .qualifications(qualificationDTOs)
      .build();
  }

  private ClerkQualificationDTO createQualificationDTO(final Qualification qualification) {
    final LanguagePairDTO languagePairDTO = LanguagePairDTO
      .builder()
      .from(qualification.getFromLang())
      .to(qualification.getToLang())
      .build();

    return ClerkQualificationDTO
      .builder()
      .id(qualification.getId())
      .version(qualification.getVersion())
      .deleted(qualification.isDeleted())
      .languagePair(languagePairDTO)
      .beginDate(qualification.getBeginDate())
      .endDate(qualification.getEndDate())
      .examinationType(qualification.getExaminationType())
      .permissionToPublish(qualification.isPermissionToPublish())
      .build();
  }

  @Transactional
  public ClerkInterpreterDTO createInterpreter(final ClerkInterpreterCreateDTO dto) {
    validateRegions(dto);
    dto.qualifications().forEach(this::validateLanguagePair);

    // TODO set person data to ONR and get OID
    final Interpreter interpreter = new Interpreter();
    interpreter.setOnrId(UUID.randomUUID().toString());

    copyFromInterpreterDTO(interpreter, dto);
    interpreterRepository.save(interpreter);
    regionRepository.saveAllAndFlush(interpreter.getRegions());

    dto.qualifications().forEach(qualificationCreateDTO -> createQualification(interpreter, qualificationCreateDTO));

    interpreterRepository.saveAndFlush(interpreter);
    return getInterpreter(interpreter.getId());
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

  private void validateLanguagePair(final ClerkQualificationDTOCommonFields dto) {
    Stream
      .of(dto.languagePair().from(), dto.languagePair().to())
      .forEach(languageCode -> {
        if (!languageService.containsKoodistoCode(languageCode)) {
          throw new APIException(APIExceptionType.QUALIFICATION_LANGUAGE_UNKNOWN);
        }
      });
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
      .map(regionCode -> {
        final Region region = new Region();
        region.setInterpreter(interpreter);
        region.setCode(regionCode);
        return region;
      })
      .toList();

    interpreter.getRegions().addAll(regions);
  }

  private void createQualification(final Interpreter interpreter, final ClerkQualificationCreateDTO dto) {
    final Qualification qualification = new Qualification();
    interpreter.getQualifications().add(qualification);
    qualification.setInterpreter(interpreter);

    copyFromQualificationDTO(qualification, dto);
    qualificationRepository.saveAndFlush(qualification);
  }

  private void copyFromQualificationDTO(
    final Qualification qualification,
    final ClerkQualificationDTOCommonFields dto
  ) {
    qualification.setFromLang(dto.languagePair().from());
    qualification.setToLang(dto.languagePair().to());
    qualification.setBeginDate(dto.beginDate());
    qualification.setEndDate(dto.endDate());
    qualification.setExaminationType(dto.examinationType());
    qualification.setPermissionToPublish(dto.permissionToPublish());
  }

  @Transactional(readOnly = true)
  public ClerkInterpreterDTO getInterpreter(final long interpreterId) {
    // This could be optimized, by fetching only one interpreter and it's data, but is it worth of the programming work?
    for (ClerkInterpreterDTO i : list()) {
      if (i.id() == interpreterId) {
        return i;
      }
    }
    throw new NotFoundException(String.format("Interpreter with id: %d not found", interpreterId));
  }

  @Transactional
  public ClerkInterpreterDTO updateInterpreter(final ClerkInterpreterUpdateDTO dto) {
    validateRegions(dto);

    final Interpreter interpreter = interpreterRepository.getById(dto.id());
    interpreter.assertVersion(dto.version());

    final List<Region> regionsToDelete = new ArrayList<>(interpreter.getRegions());
    interpreter.getRegions().removeAll(regionsToDelete);
    regionRepository.deleteAllInBatch(regionsToDelete);

    // TODO update information to ONR
    copyFromInterpreterDTO(interpreter, dto);
    regionRepository.saveAll(interpreter.getRegions());
    interpreterRepository.saveAndFlush(interpreter);

    return getInterpreter(interpreter.getId());
  }

  @Transactional
  public ClerkInterpreterDTO deleteInterpreter(final long id) {
    final Interpreter interpreter = interpreterRepository.getById(id);
    interpreter.markDeleted();
    interpreter.getQualifications().forEach(BaseEntity::markDeleted);
    return getInterpreter(id);
  }

  @Transactional
  public ClerkInterpreterDTO createQualification(final long interpreterId, final ClerkQualificationCreateDTO dto) {
    validateLanguagePair(dto);

    final Interpreter interpreter = interpreterRepository.getById(interpreterId);
    createQualification(interpreter, dto);
    interpreterRepository.saveAndFlush(interpreter);
    return getInterpreter(interpreter.getId());
  }

  @Transactional
  public ClerkInterpreterDTO updateQualification(final ClerkQualificationUpdateDTO dto) {
    validateLanguagePair(dto);

    final Qualification qualification = qualificationRepository.getById(dto.id());
    qualification.assertVersion(dto.version());
    copyFromQualificationDTO(qualification, dto);
    qualificationRepository.saveAndFlush(qualification);

    return getInterpreter(qualification.getInterpreter().getId());
  }

  @Transactional
  public ClerkInterpreterDTO deleteQualification(final long qualificationId) {
    final Qualification qualification = qualificationRepository.getById(qualificationId);
    qualification.markDeleted();
    return getInterpreter(qualification.getInterpreter().getId());
  }
}
