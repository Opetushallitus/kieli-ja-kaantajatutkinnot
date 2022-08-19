package fi.oph.akr.service;

import fi.oph.akr.api.dto.LanguagePairDTO;
import fi.oph.akr.api.dto.LanguagePairsDictDTO;
import fi.oph.akr.api.dto.TownAndCountryDTO;
import fi.oph.akr.api.dto.translator.PublicTranslatorDTO;
import fi.oph.akr.api.dto.translator.PublicTranslatorResponseDTO;
import fi.oph.akr.model.Translator;
import fi.oph.akr.repository.AuthorisationRepository;
import fi.oph.akr.repository.TranslatorLanguagePairProjection;
import fi.oph.akr.repository.TranslatorRepository;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicTranslatorService {

  @Resource
  private final AuthorisationRepository authorisationRepository;

  @Resource
  private final TranslatorRepository translatorRepository;

  @Transactional(readOnly = true)
  public PublicTranslatorResponseDTO listTranslators() {
    final Map<Long, List<TranslatorLanguagePairProjection>> translatorLanguagePairs = authorisationRepository
      .findTranslatorLanguagePairsForPublicListing()
      .stream()
      .collect(Collectors.groupingBy(TranslatorLanguagePairProjection::translatorId));

    final List<Translator> translators = translatorRepository.findAllById(translatorLanguagePairs.keySet());

    final List<PublicTranslatorDTO> publicTranslatorDTOS = translators
      .stream()
      .map(translator -> {
        final List<LanguagePairDTO> languagePairDTOs = getLanguagePairDTOs(translatorLanguagePairs, translator);
        return createPublicTranslatorDTO(translator, languagePairDTOs);
      })
      .toList();

    final LanguagePairsDictDTO languagePairsDictDTO = getLanguagePairsDictDTO();
    final List<TownAndCountryDTO> towns = getDistinctTowns(translators);

    return PublicTranslatorResponseDTO
      .builder()
      .translators(publicTranslatorDTOS)
      .langs(languagePairsDictDTO)
      .towns(towns)
      .build();
  }

  private List<LanguagePairDTO> getLanguagePairDTOs(
    final Map<Long, List<TranslatorLanguagePairProjection>> translatorLanguagePairs,
    final Translator t
  ) {
    return translatorLanguagePairs
      .getOrDefault(t.getId(), Collections.emptyList())
      .stream()
      .map(tlp -> LanguagePairDTO.builder().from(tlp.fromLang()).to(tlp.toLang()).build())
      .toList();
  }

  private PublicTranslatorDTO createPublicTranslatorDTO(
    final Translator translator,
    final List<LanguagePairDTO> languagePairDTOS
  ) {
    final String country = Optional.ofNullable(translator.getCountry()).filter(c -> !"FIN".equals(c)).orElse(null);

    return PublicTranslatorDTO
      .builder()
      .id(translator.getId())
      .firstName(translator.getFirstName())
      .lastName(translator.getLastName())
      .town(translator.getTown())
      .country(country)
      .languagePairs(languagePairDTOS)
      .build();
  }

  private LanguagePairsDictDTO getLanguagePairsDictDTO() {
    final List<String> fromLangs = authorisationRepository.getDistinctFromLangs();
    final List<String> toLangs = authorisationRepository.getDistinctToLangs();

    return LanguagePairsDictDTO.builder().from(fromLangs).to(toLangs).build();
  }

  private List<TownAndCountryDTO> getDistinctTowns(final Collection<Translator> translators) {
    return translators
      .stream()
      .map(translator -> {
        if (translator.getTown() == null) {
          return null;
        }
        if (translator.getCountry() == null || translator.getCountry().equals("FIN")) {
          return TownAndCountryDTO.builder().name(translator.getTown()).build();
        }
        return TownAndCountryDTO.builder().name(translator.getTown()).country(translator.getCountry()).build();
      })
      .filter(Objects::nonNull)
      .distinct()
      .sorted(townAndCountryDTOCompare())
      .toList();
  }

  private Comparator<TownAndCountryDTO> townAndCountryDTOCompare() {
    final Comparator<TownAndCountryDTO> byCountry = Comparator.comparing(
      TownAndCountryDTO::country,
      Comparator.nullsFirst(Comparator.naturalOrder())
    );
    return byCountry.thenComparing(TownAndCountryDTO::name);
  }
}
