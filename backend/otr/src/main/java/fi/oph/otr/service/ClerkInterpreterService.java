package fi.oph.otr.service;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTO;
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
import fi.oph.otr.util.exception.APIException;
import fi.oph.otr.util.exception.APIExceptionType;
import fi.oph.otr.util.exception.NotFoundException;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
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

  @Transactional(readOnly = true)
  public List<ClerkInterpreterDTO> listInterpreters() {
    final Map<Long, List<Kielipari>> languagePairs = languagePairRepository
      .findAll()
      .stream()
      .collect(Collectors.groupingBy(lp -> lp.getOikeustulkki().getId()));

    final Map<Long, List<Sijainti>> locations = locationRepository
      .findAll()
      .stream()
      .collect(Collectors.groupingBy(loc -> loc.getOikeustulkki().getId()));

    final Map<Long, List<Oikeustulkki>> legalInterpreters = legalInterpreterRepository
      .findAll()
      .stream()
      .collect(Collectors.groupingBy(li -> li.getTulkki().getId()));

    return interpreterRepository
      .findAll()
      .stream()
      .map(i -> toDTO(i, legalInterpreters, languagePairs, locations))
      .toList();
  }

  private ClerkInterpreterDTO toDTO(
    final Tulkki interpreter,
    final Map<Long, List<Oikeustulkki>> legalInterpreters,
    final Map<Long, List<Kielipari>> legalInterpreterLanguagePairs,
    final Map<Long, List<Sijainti>> legalInterpreterLocations
  ) {
    return ClerkInterpreterDTO
      .builder()
      .id(interpreter.getId())
      .version(interpreter.getVersion())
      .deleted(interpreter.isPoistettu())
      // FIXME fetch details from onr
      .identityNumber("TODO")
      .firstName("Etunimi:" + interpreter.getHenkiloOid())
      .nickName("Kutsumanimi:" + interpreter.getHenkiloOid())
      .lastName("Sukunimi:" + interpreter.getHenkiloOid())
      .email("TODOfoo@bar.invalid")
      .legalInterpreters(
        legalInterpreters
          .get(interpreter.getId())
          .stream()
          .map(legalInterpreter ->
            ClerkLegalInterpreterDTO
              .builder()
              .id(legalInterpreter.getId())
              .version(legalInterpreter.getVersion())
              .deleted(legalInterpreter.isPoistettu())
              .examinationType(ClerkLegalInterpreterExaminationTypeDTO.fromDbEnum(legalInterpreter.getTutkintoTyyppi()))
              .permissionToPublishEmail(legalInterpreter.isJulkaisulupaEmail())
              .permissionToPublishPhone(legalInterpreter.isJulkaisulupaPuhelinnumero())
              .permissionToPublishOtherContactInfo(legalInterpreter.isJulkaisulupaMuuYhteystieto())
              .permissionToPublish(legalInterpreter.isJulkaisulupa())
              .otherContactInfo(legalInterpreter.getMuuYhteystieto())
              .extraInformation(legalInterpreter.getLisatiedot())
              .areas(
                legalInterpreterLocations
                  .getOrDefault(legalInterpreter.getId(), Collections.emptyList())
                  .stream()
                  .map(Sijainti::getKoodi)
                  .filter(Objects::nonNull)
                  .toList()
              )
              .languages(
                legalInterpreterLanguagePairs
                  .get(legalInterpreter.getId())
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
                  .toList()
              )
              .build()
          )
          .toList()
      )
      .build();
  }

  @Transactional
  public ClerkInterpreterDTO create(final ClerkInterpreterCreateDTO dto) {
    // TODO set person data to ONR and get OID
    final Tulkki interpreter = new Tulkki(UUID.randomUUID().toString());
    interpreterRepository.save(interpreter);
    dto
      .legalInterpreters()
      .forEach(legalInterpreterCreateDTO -> createLegalInterpreter(interpreter, legalInterpreterCreateDTO));
    interpreterRepository.saveAndFlush(interpreter);
    return getInterpreter(interpreter.getId());
  }

  private void createLegalInterpreter(final Tulkki interpreter, final ClerkLegalInterpreterCreateDTO dto) {
    final Oikeustulkki legalInterpreter = new Oikeustulkki();
    copyFromDTO(dto, legalInterpreter);
    interpreter.getOikeustulkit().add(legalInterpreter);
    legalInterpreter.setTulkki(interpreter);
    legalInterpreterRepository.saveAndFlush(legalInterpreter);
    locationRepository.saveAllAndFlush(legalInterpreter.getSijainnit());
    languagePairRepository.saveAllAndFlush(legalInterpreter.getKielet());
  }

  private void copyFromDTO(final ClerkLegalInterpreterDTOCommonFields dto, final Oikeustulkki legalInterpreter) {
    dto
      .areas()
      .forEach(regionCode -> {
        if (!regionService.listKoodistoCodes().contains(regionCode)) {
          throw new APIException(APIExceptionType.LEGAL_INTERPRETER_REGION_UNKNOWN);
        }
      });

    legalInterpreter.setTutkintoTyyppi(dto.examinationType().toDbEnum());
    legalInterpreter.setJulkaisulupaEmail(dto.permissionToPublishEmail());
    legalInterpreter.setJulkaisulupaPuhelinnumero(dto.permissionToPublishPhone());
    legalInterpreter.setJulkaisulupaMuuYhteystieto(dto.permissionToPublishOtherContactInfo());
    legalInterpreter.setJulkaisulupa(dto.permissionToPublish());
    legalInterpreter.setMuuYhteystieto(dto.otherContactInfo());
    legalInterpreter.setLisatiedot(dto.extraInformation());
    final Set<Sijainti> locations = dto
      .areas()
      .stream()
      .map(regionCode -> new Sijainti(legalInterpreter, Sijainti.Tyyppi.MAAKUNTA, regionCode))
      .collect(Collectors.toSet());
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

    legalInterpreter.getSijainnit().addAll(locations);
    legalInterpreter.getKielet().addAll(languagePairs);
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
    final Tulkki interpreter = interpreterRepository.getById(dto.id());
    interpreter.assertVersion(dto.version());
    // TODO update clerk information to ONR
    return getInterpreter(dto.id());
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
    final Tulkki interpreter = interpreterRepository.getById(interpreterId);
    createLegalInterpreter(interpreter, dto);
    interpreterRepository.saveAndFlush(interpreter);
    return getInterpreter(interpreter.getId());
  }

  @Transactional
  public ClerkInterpreterDTO updateLegalInterpreter(final ClerkLegalInterpreterUpdateDTO dto) {
    final Oikeustulkki legalInterpreter = legalInterpreterRepository.getById(dto.id());
    legalInterpreter.assertVersion(dto.version());

    final Set<Kielipari> langPairsToDelete = new HashSet<>(legalInterpreter.getKielet());
    legalInterpreter.getKielet().removeAll(langPairsToDelete);
    languagePairRepository.deleteAllInBatch(langPairsToDelete);

    final Set<Sijainti> locationsToDelete = new HashSet<>(legalInterpreter.getSijainnit());
    legalInterpreter.getSijainnit().removeAll(locationsToDelete);
    locationRepository.deleteAllInBatch(locationsToDelete);

    copyFromDTO(dto, legalInterpreter);

    legalInterpreterRepository.saveAndFlush(legalInterpreter);
    locationRepository.saveAllAndFlush(legalInterpreter.getSijainnit());
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
