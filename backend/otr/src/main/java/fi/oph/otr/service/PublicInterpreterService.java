package fi.oph.otr.service;

import fi.oph.otr.api.dto.InterpreterDTO;
import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.model.Tulkki;
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

    final List<Tulkki> interpreters = interpreterRepository.findAllById(interpreterLanguagePairs.keySet());
    return interpreters
      .stream()
      .map(i ->
        InterpreterDTO
          .builder()
          // FIXME name not available, fetch from onr
          .firstName("Etunimi:" + i.getHenkiloOid())
          .lastName("Sukunumi:" + i.getHenkiloOid())
          .area("") // TODO
          .languages(
            interpreterLanguagePairs
              .get(i.getId())
              .stream()
              .map(t -> LanguagePairDTO.builder().from(t.from()).to(t.to()).build())
              .toList()
          )
          .build()
      )
      .toList();
  }
}
