package fi.oph.otr.service;

import fi.oph.otr.api.dto.InterpreterDTO;
import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.Region;
import fi.oph.otr.repository.InterpreterLanguagePairProjection;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.LanguagePairRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicInterpreterService {

  @Resource
  private final InterpreterRepository interpreterRepository;

  @Resource
  private final LanguagePairRepository languagePairRepository;

  @Transactional(readOnly = true)
  public List<InterpreterDTO> list() {
    final Map<Long, List<InterpreterLanguagePairProjection>> interpreterLanguagePairs = languagePairRepository
      .findLanguagePairsForPublicListing()
      .stream()
      .collect(Collectors.groupingBy(InterpreterLanguagePairProjection::interpreterId));

    final List<Interpreter> interpreters = interpreterRepository.findAllById(interpreterLanguagePairs.keySet());

    return interpreters.stream().map(i -> toDTO(i, interpreterLanguagePairs.get(i.getId()))).toList();
  }

  private InterpreterDTO toDTO(
    final Interpreter interpreter,
    final List<InterpreterLanguagePairProjection> languagePairProjections
  ) {
    // TODO: fetch regions in list() method as a map
    final List<String> regions = interpreter.getRegions().stream().map(Region::getCode).toList();

    final List<LanguagePairDTO> languagePairs = languagePairProjections
      .stream()
      .map(t -> LanguagePairDTO.builder().from(t.fromLang()).to(t.toLang()).build())
      .toList();

    return InterpreterDTO
      .builder()
      // FIXME fetch details from onr
      .firstName("Etunimi:" + interpreter.getOnrId())
      .lastName("Sukunimi:" + interpreter.getOnrId())
      .email(interpreter.isPermissionToPublishEmail() ? "tulkki" + interpreter.getId() + "@invalid" : null)
      .phoneNumber(interpreter.isPermissionToPublishPhone() ? "+3584000000" + interpreter.getId() : null)
      .otherContactInfo(
        interpreter.isPermissionToPublishOtherContactInfo() ? interpreter.getOtherContactInformation() : null
      )
      .areas(regions)
      .languages(languagePairs)
      .build();
  }
}
