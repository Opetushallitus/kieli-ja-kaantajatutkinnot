package fi.oph.otr.service;

import fi.oph.otr.api.dto.InterpreterDTO;
import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.model.Tulkki;
import fi.oph.otr.repository.InterpreterLanguagePairProjection;
import fi.oph.otr.repository.InterpreterLegalInterpreterProjection;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.LanguagePairRepository;
import fi.oph.otr.repository.LegalInterpreterRepository;
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
  private final LegalInterpreterRepository legalInterpreterRepository;

  @Resource
  private final LanguagePairRepository languagePairRepository;

  @Transactional(readOnly = true)
  public List<InterpreterDTO> list() {
    final Map<Long, List<InterpreterLanguagePairProjection>> interpreterLanguagePairs = languagePairRepository
      .findLanguagePairsForPublicListing()
      .stream()
      .collect(Collectors.groupingBy(InterpreterLanguagePairProjection::interpreterId));

    final Map<Long, List<InterpreterLegalInterpreterProjection>> legalInterpreters = legalInterpreterRepository
      .findLegalInterpretersForPublicListing()
      .stream()
      .collect(Collectors.groupingBy(InterpreterLegalInterpreterProjection::interpreterId));

    final List<Tulkki> interpreters = interpreterRepository.findAllById(interpreterLanguagePairs.keySet());

    return interpreters
      .stream()
      .map(i -> {
        // Expects that each legal interpreter for a single interpreter contains the same publish permission details for
        // contact information and the same other contact info.
        final InterpreterLegalInterpreterProjection legalInterpreterProjection = legalInterpreters
          .get(i.getId())
          .get(0);
        final List<InterpreterLanguagePairProjection> languagePairProjections = interpreterLanguagePairs.get(i.getId());

        return toDTO(i, legalInterpreterProjection, languagePairProjections);
      })
      .toList();
  }

  private InterpreterDTO toDTO(
    final Tulkki interpreter,
    final InterpreterLegalInterpreterProjection legalInterpreterProjection,
    final List<InterpreterLanguagePairProjection> languagePairProjections
  ) {
    // FIXME fetch from onr
    final String email = legalInterpreterProjection.permissionToPublishEmail()
      ? "tulkki" + interpreter.getId() + "@invalid"
      : null;
    final String phoneNumber = legalInterpreterProjection.permissionToPublishPhone()
      ? "+3584000000" + interpreter.getId()
      : null;
    final String otherContactInfo = legalInterpreterProjection.permissionToPublishOtherContactInfo()
      ? legalInterpreterProjection.otherContactInfo()
      : null;

    // TODO
    final List<String> areas = List.of();

    final List<LanguagePairDTO> languagePairs = languagePairProjections
      .stream()
      .map(t -> LanguagePairDTO.builder().from(t.from()).to(t.to()).build())
      .toList();

    return InterpreterDTO
      .builder()
      // FIXME name not available, fetch from onr
      .firstName("Etunimi:" + interpreter.getHenkiloOid())
      .lastName("Sukunimi:" + interpreter.getHenkiloOid())
      .email(email)
      .phoneNumber(phoneNumber)
      .otherContactInfo(otherContactInfo)
      .areas(areas)
      .languages(languagePairs)
      .build();
  }
}
