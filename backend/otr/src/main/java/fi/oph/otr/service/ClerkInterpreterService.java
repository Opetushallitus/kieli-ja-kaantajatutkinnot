package fi.oph.otr.service;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTO;
import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTOCommonFields;
import fi.oph.otr.api.dto.clerk.ClerkLanguagePairDTO;
import fi.oph.otr.api.dto.clerk.ClerkLegalInterpreterDTO;
import fi.oph.otr.api.dto.clerk.ClerkLegalInterpreterDTOCommonFields;
import fi.oph.otr.api.dto.clerk.ClerkLegalInterpreterExaminationTypeDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterUpdateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterUpdateDTO;
import fi.oph.otr.model.Kielipari;
import fi.oph.otr.model.Oikeustulkki;
import fi.oph.otr.model.Sijainti;
import fi.oph.otr.model.Tulkki;
import fi.oph.otr.model.embeddable.Kieli;
import fi.oph.otr.model.feature.Mutable;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.LanguagePairRepository;
import fi.oph.otr.repository.LegalInterpreterRepository;
import fi.oph.otr.repository.LocationRepository;
import fi.oph.otr.util.LegalInterpreterData;
import fi.oph.otr.util.LocationData;
import fi.oph.otr.util.exception.APIException;
import fi.oph.otr.util.exception.APIExceptionType;
import fi.oph.otr.util.exception.NotFoundException;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
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
  private final LegalInterpreterRepository legalInterpreterRepository;

  @Resource
  private final LanguagePairRepository languagePairRepository;

  @Resource
  private final LocationRepository locationRepository;

  @Resource
  private final RegionService regionService;

  @Resource
  private final LanguageService languageService;

  @Transactional(readOnly = true)
  public List<ClerkInterpreterDTO> listInterpreters() {
    final Map<Long, List<Oikeustulkki>> legalInterpreters = legalInterpreterRepository
      .findAll()
      .stream()
      .collect(Collectors.groupingBy(li -> li.getTulkki().getId()));

    final Map<Long, List<Kielipari>> languagePairs = languagePairRepository
      .findAll()
      .stream()
      .collect(Collectors.groupingBy(lp -> lp.getOikeustulkki().getId()));

    return interpreterRepository
      .findAll()
      .stream()
      .map(i -> createClerkInterpreterDTO(i, legalInterpreters.get(i.getId()), languagePairs))
      .toList();
  }

  private ClerkInterpreterDTO createClerkInterpreterDTO(
    final Tulkki interpreter,
    final List<Oikeustulkki> legalInterpreters,
    final Map<Long, List<Kielipari>> legalInterpreterLanguagePairs
  ) {
    final List<ClerkLegalInterpreterDTO> legalInterpreterDTOS = legalInterpreters
      .stream()
      .map(li -> createLegalInterpreterDTO(li, legalInterpreterLanguagePairs.get(li.getId())))
      .toList();

    final LegalInterpreterData liData = getLegalInterpreterData(legalInterpreters);
    final List<String> areas = liData.areas().stream().map(LocationData::code).filter(Objects::nonNull).toList();

    // FIXME fetch details from onr
    return ClerkInterpreterDTO
      .builder()
      .id(interpreter.getId())
      .version(interpreter.getVersion())
      .deleted(interpreter.isPoistettu())
      .identityNumber("TODO")
      .firstName("Etunimi:" + interpreter.getHenkiloOid())
      .nickName("Kutsumanimi:" + interpreter.getHenkiloOid())
      .lastName("Sukunimi:" + interpreter.getHenkiloOid())
      .email("TODOfoo@bar.invalid")
      .permissionToPublishEmail(liData.permissionToPublishEmail())
      .phoneNumber(null)
      .permissionToPublishPhone(liData.permissionToPublishPhone())
      .otherContactInfo(liData.otherContactInfo())
      .permissionToPublishOtherContactInfo(liData.permissionToPublishOtherContactInfo())
      .street(null)
      .postalCode(null)
      .town(null)
      .extraInformation(liData.extraInformation())
      .areas(areas)
      .legalInterpreters(legalInterpreterDTOS)
      .build();
  }

  private ClerkLegalInterpreterDTO createLegalInterpreterDTO(
    final Oikeustulkki legalInterpreter,
    final List<Kielipari> languagePairs
  ) {
    final List<ClerkLanguagePairDTO> languagePairDTOS = languagePairs
      .stream()
      .map(langPair ->
        ClerkLanguagePairDTO
          .builder()
          .from(langPair.getKielesta().getKoodi())
          .to(langPair.getKieleen().getKoodi())
          .beginDate(langPair.getVoimassaoloAlkaa())
          .endDate(langPair.getVoimassaoloPaattyy())
          .build()
      )
      .toList();

    return ClerkLegalInterpreterDTO
      .builder()
      .id(legalInterpreter.getId())
      .version(legalInterpreter.getVersion())
      .deleted(legalInterpreter.isPoistettu())
      .examinationType(ClerkLegalInterpreterExaminationTypeDTO.fromDbEnum(legalInterpreter.getTutkintoTyyppi()))
      .permissionToPublish(legalInterpreter.isJulkaisulupa())
      .languages(languagePairDTOS)
      .build();
  }

  private LegalInterpreterData getLegalInterpreterData(final List<Oikeustulkki> legalInterpreters) {
    final Oikeustulkki legalInterpreter = legalInterpreters
      .stream()
      .min(Comparator.comparing(Oikeustulkki::isPoistettu))
      .get();

    final List<LocationData> areas = legalInterpreter
      .getSijainnit()
      .stream()
      .map(loc -> new LocationData(loc.getTyyppi(), loc.getKoodi()))
      .toList();

    return new LegalInterpreterData(
      legalInterpreter.isJulkaisulupaEmail(),
      legalInterpreter.isJulkaisulupaPuhelinnumero(),
      legalInterpreter.getMuuYhteystieto(),
      legalInterpreter.isJulkaisulupaMuuYhteystieto(),
      legalInterpreter.getLisatiedot(),
      areas
    );
  }

  @Transactional
  public ClerkInterpreterDTO create(final ClerkInterpreterCreateDTO dto) {
    // TODO set person data to ONR and get OID

    validateRegions(dto);
    dto.legalInterpreters().forEach(this::validateLanguages);

    final Tulkki interpreter = new Tulkki(UUID.randomUUID().toString());
    interpreterRepository.save(interpreter);

    final LegalInterpreterData liData = getLegalInterpreterData(dto);
    dto
      .legalInterpreters()
      .forEach(legalInterpreterCreateDTO -> createLegalInterpreter(interpreter, legalInterpreterCreateDTO, liData));

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
          throw new APIException(APIExceptionType.LEGAL_INTERPRETER_LANGUAGE_UNKNOWN);
        }
      });
  }

  private LegalInterpreterData getLegalInterpreterData(final ClerkInterpreterDTOCommonFields dto) {
    // TODO
    final List<LocationData> areas = dto
      .areas()
      .stream()
      .map(a -> new LocationData(Sijainti.Tyyppi.MAAKUNTA, a))
      .toList();

    return new LegalInterpreterData(
      dto.permissionToPublishEmail(),
      dto.permissionToPublishPhone(),
      dto.otherContactInfo(),
      dto.permissionToPublishOtherContactInfo(),
      dto.extraInformation(),
      areas
    );
  }

  private void createLegalInterpreter(
    final Tulkki interpreter,
    final ClerkLegalInterpreterCreateDTO dto,
    final LegalInterpreterData liData
  ) {
    final Oikeustulkki legalInterpreter = new Oikeustulkki();
    interpreter.getOikeustulkit().add(legalInterpreter);
    legalInterpreter.setTulkki(interpreter);

    copyFromLegalInterpreterDTO(legalInterpreter, dto);
    copyFromLegalInterpreterData(legalInterpreter, liData);

    legalInterpreterRepository.saveAndFlush(legalInterpreter);
    languagePairRepository.saveAllAndFlush(legalInterpreter.getKielet());
    locationRepository.saveAllAndFlush(legalInterpreter.getSijainnit());
  }

  private void copyFromLegalInterpreterDTO(
    final Oikeustulkki legalInterpreter,
    final ClerkLegalInterpreterDTOCommonFields dto
  ) {
    legalInterpreter.setTutkintoTyyppi(dto.examinationType().toDbEnum());
    legalInterpreter.setJulkaisulupa(dto.permissionToPublish());

    final List<Kielipari> languagePairs = dto
      .languages()
      .stream()
      .map(languagePairDTO ->
        new Kielipari(
          legalInterpreter,
          new Kieli(languagePairDTO.from()),
          new Kieli(languagePairDTO.to()),
          languagePairDTO.beginDate(),
          languagePairDTO.endDate()
        )
      )
      .toList();

    legalInterpreter.getKielet().addAll(languagePairs);
  }

  private void copyFromLegalInterpreterData(final Oikeustulkki legalInterpreter, final LegalInterpreterData liData) {
    legalInterpreter.setJulkaisulupaEmail(liData.permissionToPublishEmail());
    legalInterpreter.setJulkaisulupaPuhelinnumero(liData.permissionToPublishPhone());
    legalInterpreter.setMuuYhteystieto(liData.otherContactInfo());
    legalInterpreter.setJulkaisulupaMuuYhteystieto(liData.permissionToPublishOtherContactInfo());
    legalInterpreter.setLisatiedot(liData.extraInformation());

    final List<Sijainti> locations = liData
      .areas()
      .stream()
      .map(locationData -> new Sijainti(legalInterpreter, locationData.locationType(), locationData.code()))
      .toList();

    legalInterpreter.getSijainnit().addAll(locations);
  }

  @Transactional(readOnly = true)
  public ClerkInterpreterDTO getInterpreter(final long interpreterId) {
    // This could be optimized, by fetching only one interpreter and it's data, but is it worth of the programming work?
    for (ClerkInterpreterDTO i : listInterpreters()) {
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

    // TODO update clerk information to ONR

    final LegalInterpreterData liData = getLegalInterpreterData(dto);
    final Set<Oikeustulkki> legalInterpreters = interpreter.getOikeustulkit();

    legalInterpreters.forEach(legalInterpreter -> {
      final Set<Sijainti> locationsToDelete = new HashSet<>(legalInterpreter.getSijainnit());
      legalInterpreter.getSijainnit().removeAll(locationsToDelete);
      locationRepository.deleteAllInBatch(locationsToDelete);

      copyFromLegalInterpreterData(legalInterpreter, liData);
      locationRepository.saveAllAndFlush(legalInterpreter.getSijainnit());
    });

    legalInterpreterRepository.saveAllAndFlush(legalInterpreters);
    interpreterRepository.saveAndFlush(interpreter);
    return getInterpreter(interpreter.getId());
  }

  @Transactional
  public ClerkInterpreterDTO deleteInterpreter(final long id) {
    final Tulkki interpreter = interpreterRepository.getById(id);
    interpreter.markPoistettu();
    interpreter.getOikeustulkit().forEach(Mutable::markPoistettu);
    return getInterpreter(id);
  }

  @Transactional
  public ClerkInterpreterDTO createLegalInterpreter(
    final long interpreterId,
    final ClerkLegalInterpreterCreateDTO dto
  ) {
    validateLanguages(dto);

    final Tulkki interpreter = interpreterRepository.getById(interpreterId);
    final Set<Oikeustulkki> legalInterpreters = interpreter.getOikeustulkit();
    final LegalInterpreterData liData = getLegalInterpreterData(legalInterpreters.stream().toList());

    createLegalInterpreter(interpreter, dto, liData);
    interpreterRepository.saveAndFlush(interpreter);
    return getInterpreter(interpreter.getId());
  }

  @Transactional
  public ClerkInterpreterDTO updateLegalInterpreter(final ClerkLegalInterpreterUpdateDTO dto) {
    validateLanguages(dto);

    final Oikeustulkki legalInterpreter = legalInterpreterRepository.getById(dto.id());
    legalInterpreter.assertVersion(dto.version());

    final Set<Kielipari> langPairsToDelete = new HashSet<>(legalInterpreter.getKielet());
    legalInterpreter.getKielet().removeAll(langPairsToDelete);
    languagePairRepository.deleteAllInBatch(langPairsToDelete);

    copyFromLegalInterpreterDTO(legalInterpreter, dto);
    legalInterpreterRepository.saveAndFlush(legalInterpreter);
    languagePairRepository.saveAllAndFlush(legalInterpreter.getKielet());

    return getInterpreter(legalInterpreter.getTulkki().getId());
  }

  @Transactional
  public ClerkInterpreterDTO deleteLegalInterpreter(final long legalInterpreterId) {
    final Oikeustulkki legalInterpreter = legalInterpreterRepository.getById(legalInterpreterId);
    legalInterpreter.markPoistettu();
    return getInterpreter(legalInterpreter.getTulkki().getId());
  }
}
