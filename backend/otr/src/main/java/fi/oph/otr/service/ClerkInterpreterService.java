package fi.oph.otr.service;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTO;
import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTOCommonFields;
import fi.oph.otr.api.dto.clerk.ClerkLanguagePairDTO;
import fi.oph.otr.api.dto.clerk.ClerkLegalInterpreterDTO;
import fi.oph.otr.api.dto.clerk.ClerkLegalInterpreterDTOCommonFields;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterUpdateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterUpdateDTO;
import fi.oph.otr.model.Kielipari;
import fi.oph.otr.model.Oikeustulkki;
import fi.oph.otr.model.Sijainti;
import fi.oph.otr.model.Tulkki;
import fi.oph.otr.model.feature.Mutable;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.LanguagePairRepository;
import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.repository.RegionRepository;
import fi.oph.otr.util.exception.APIException;
import fi.oph.otr.util.exception.APIExceptionType;
import fi.oph.otr.util.exception.NotFoundException;
import java.util.ArrayList;
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
  private final LanguagePairRepository languagePairRepository;

  @Resource
  private final RegionRepository regionRepository;

  @Resource
  private final RegionService regionService;

  @Resource
  private final LanguageService languageService;

  @Transactional(readOnly = true)
  public List<ClerkInterpreterDTO> list() {
    final Map<Long, List<Oikeustulkki>> interpreterQualifications = qualificationRepository
      .findAll()
      .stream()
      .collect(Collectors.groupingBy(q -> q.getInterpreter().getId()));

    final Map<Long, List<Kielipari>> qualificationLanguagePairs = languagePairRepository
      .findAll()
      .stream()
      .collect(Collectors.groupingBy(lp -> lp.getQualification().getId()));

    return interpreterRepository
      .findAll()
      .stream()
      .map(i -> createClerkInterpreterDTO(i, interpreterQualifications.get(i.getId()), qualificationLanguagePairs))
      .toList();
  }

  private ClerkInterpreterDTO createClerkInterpreterDTO(
    final Tulkki interpreter,
    final List<Oikeustulkki> qualifications,
    final Map<Long, List<Kielipari>> qualificationLanguagePairs
  ) {
    final List<ClerkLegalInterpreterDTO> qualificationDTOs = qualifications
      .stream()
      .map(q -> createQualificationDTO(q, qualificationLanguagePairs.get(q.getId())))
      .toList();

    // TODO: fetch regions in list() method as a map
    final List<String> regions = interpreter.getRegions().stream().map(Sijainti::getCode).toList();

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
      .areas(regions)
      .legalInterpreters(qualificationDTOs)
      .build();
  }

  private ClerkLegalInterpreterDTO createQualificationDTO(
    final Oikeustulkki qualification,
    final List<Kielipari> languagePairs
  ) {
    final List<ClerkLanguagePairDTO> languages = languagePairs
      .stream()
      .map(langPair ->
        ClerkLanguagePairDTO
          .builder()
          .from(langPair.getFromLang())
          .to(langPair.getToLang())
          .beginDate(langPair.getBeginDate())
          .endDate(langPair.getEndDate())
          .build()
      )
      .toList();

    return ClerkLegalInterpreterDTO
      .builder()
      .id(qualification.getId())
      .version(qualification.getVersion())
      .deleted(qualification.isDeleted())
      .examinationType(qualification.getExaminationType())
      .permissionToPublish(qualification.isPermissionToPublish())
      .languages(languages)
      .build();
  }

  @Transactional
  public ClerkInterpreterDTO createInterpreter(final ClerkInterpreterCreateDTO dto) {
    validateRegions(dto);
    dto.legalInterpreters().forEach(this::validateLanguages);

    // TODO set person data to ONR and get OID
    final Tulkki interpreter = new Tulkki();
    interpreter.setOnrId(UUID.randomUUID().toString());

    copyFromInterpreterDTO(interpreter, dto);
    interpreterRepository.save(interpreter);
    regionRepository.saveAllAndFlush(interpreter.getRegions());

    dto.legalInterpreters().forEach(qualificationCreateDTO -> createQualification(interpreter, qualificationCreateDTO));

    interpreterRepository.saveAndFlush(interpreter);
    return getInterpreter(interpreter.getId());
  }

  private void validateRegions(final ClerkInterpreterDTOCommonFields dto) {
    dto
      .areas()
      .forEach(regionCode -> {
        if (!regionService.containsKoodistoCode(regionCode)) {
          throw new APIException(APIExceptionType.INTERPRETER_REGION_UNKNOWN);
        }
      });
  }

  private void validateLanguages(final ClerkLegalInterpreterDTOCommonFields dto) {
    dto
      .languages()
      .stream()
      .flatMap(languagePair -> Stream.of(languagePair.from(), languagePair.to()))
      .forEach(languageCode -> {
        if (!languageService.containsKoodistoCode(languageCode)) {
          throw new APIException(APIExceptionType.QUALIFICATION_LANGUAGE_UNKNOWN);
        }
      });
  }

  private void copyFromInterpreterDTO(final Tulkki interpreter, final ClerkInterpreterDTOCommonFields dto) {
    interpreter.setPermissionToPublishEmail(dto.permissionToPublishEmail());
    interpreter.setPermissionToPublishPhone(dto.permissionToPublishPhone());
    interpreter.setOtherContactInformation(dto.otherContactInfo());
    interpreter.setPermissionToPublishOtherContactInfo(dto.permissionToPublishOtherContactInfo());
    interpreter.setExtraInformation(dto.extraInformation());

    final List<Sijainti> regions = dto
      .areas()
      .stream()
      .map(regionCode -> {
        final Sijainti region = new Sijainti();
        region.setInterpreter(interpreter);
        region.setCode(regionCode);
        return region;
      })
      .toList();

    interpreter.getRegions().addAll(regions);
  }

  private void createQualification(final Tulkki interpreter, final ClerkLegalInterpreterCreateDTO dto) {
    final Oikeustulkki qualification = new Oikeustulkki();
    interpreter.getQualifications().add(qualification);
    qualification.setInterpreter(interpreter);

    copyFromQualificationDTO(qualification, dto);
    qualificationRepository.saveAndFlush(qualification);
    languagePairRepository.saveAllAndFlush(qualification.getLanguagePairs());
  }

  private void copyFromQualificationDTO(
    final Oikeustulkki qualification,
    final ClerkLegalInterpreterDTOCommonFields dto
  ) {
    qualification.setExaminationType(dto.examinationType());
    qualification.setPermissionToPublish(dto.permissionToPublish());

    final List<Kielipari> languagePairs = dto
      .languages()
      .stream()
      .map(languagePairDTO -> {
        final Kielipari languagePair = new Kielipari();
        languagePair.setQualification(qualification);
        languagePair.setFromLang(languagePairDTO.from());
        languagePair.setToLang(languagePairDTO.to());
        languagePair.setBeginDate(languagePairDTO.beginDate());
        languagePair.setEndDate(languagePairDTO.endDate());
        return languagePair;
      })
      .toList();

    qualification.getLanguagePairs().addAll(languagePairs);
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

    final Tulkki interpreter = interpreterRepository.getById(dto.id());
    interpreter.assertVersion(dto.version());

    final List<Sijainti> regionsToDelete = new ArrayList<>(interpreter.getRegions());
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
    final Tulkki interpreter = interpreterRepository.getById(id);
    interpreter.markDeleted();
    interpreter.getQualifications().forEach(Mutable::markDeleted);
    return getInterpreter(id);
  }

  @Transactional
  public ClerkInterpreterDTO createQualification(final long interpreterId, final ClerkLegalInterpreterCreateDTO dto) {
    validateLanguages(dto);

    final Tulkki interpreter = interpreterRepository.getById(interpreterId);
    createQualification(interpreter, dto);
    interpreterRepository.saveAndFlush(interpreter);
    return getInterpreter(interpreter.getId());
  }

  @Transactional
  public ClerkInterpreterDTO updateQualification(final ClerkLegalInterpreterUpdateDTO dto) {
    validateLanguages(dto);

    final Oikeustulkki qualification = qualificationRepository.getById(dto.id());
    qualification.assertVersion(dto.version());

    final List<Kielipari> langPairsToDelete = new ArrayList<>(qualification.getLanguagePairs());
    qualification.getLanguagePairs().removeAll(langPairsToDelete);
    languagePairRepository.deleteAllInBatch(langPairsToDelete);

    copyFromQualificationDTO(qualification, dto);
    languagePairRepository.saveAll(qualification.getLanguagePairs());
    qualificationRepository.saveAndFlush(qualification);

    return getInterpreter(qualification.getInterpreter().getId());
  }

  @Transactional
  public ClerkInterpreterDTO deleteQualification(final long qualificationId) {
    final Oikeustulkki qualification = qualificationRepository.getById(qualificationId);
    qualification.markDeleted();
    return getInterpreter(qualification.getInterpreter().getId());
  }
}
