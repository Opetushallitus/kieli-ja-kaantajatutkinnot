package fi.oph.akr.service;

import fi.oph.akr.api.dto.LanguagePairDTO;
import fi.oph.akr.api.dto.LanguagePairsDictDTO;
import fi.oph.akr.api.dto.PublicTownDTO;
import fi.oph.akr.api.dto.translator.PublicTranslatorDTO;
import fi.oph.akr.api.dto.translator.PublicTranslatorResponseDTO;
import fi.oph.akr.config.CacheConfig;
import fi.oph.akr.model.Translator;
import fi.oph.akr.repository.AuthorisationRepository;
import fi.oph.akr.repository.TranslatorLanguagePairProjection;
import fi.oph.akr.repository.TranslatorRepository;
import fi.oph.akr.service.koodisto.PostalCodeService;
import java.util.ArrayList;
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
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class PublicTranslatorService {

  @Resource
  private final AuthorisationRepository authorisationRepository;

  @Resource
  private final TranslatorRepository translatorRepository;

  @Resource
  private final PostalCodeService postalCodeService;

  @Cacheable(cacheNames = CacheConfig.CACHE_NAME_PUBLIC_TRANSLATORS)
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
      .collect(Collectors.toCollection(ArrayList::new));

    final LanguagePairsDictDTO languagePairsDictDTO = getLanguagePairsDictDTO();
    final List<PublicTownDTO> towns = getDistinctTowns(translators);

    Collections.shuffle(publicTranslatorDTOS);
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
    final String country = resolveCountry(translator);
    final Pair<String, String> townTranslated = resolveTownTranslated(translator.getTown(), country);
    return PublicTranslatorDTO
      .builder()
      .id(translator.getId())
      .firstName(translator.getFirstName())
      .lastName(translator.getLastName())
      .town(townTranslated.getLeft())
      .country(country)
      .languagePairs(languagePairDTOS)
      .build();
  }

  private LanguagePairsDictDTO getLanguagePairsDictDTO() {
    final List<String> fromLangs = authorisationRepository.getDistinctFromLangs();
    final List<String> toLangs = authorisationRepository.getDistinctToLangs();

    return LanguagePairsDictDTO.builder().from(fromLangs).to(toLangs).build();
  }

  private List<PublicTownDTO> getDistinctTowns(final Collection<Translator> translators) {
    return translators
      .stream()
      .map(translator -> {
        if (!StringUtils.hasText(translator.getTown())) {
          return null;
        }
        final String country = resolveCountry(translator);
        final Pair<String, String> townTranslated = resolveTownTranslated(translator.getTown(), country);
        return PublicTownDTO
          .builder()
          .name(townTranslated.getLeft())
          .nameSv(townTranslated.getRight())
          .country(country)
          .build();
      })
      .filter(Objects::nonNull)
      .distinct()
      .sorted(publicTownDTOCompare())
      .toList();
  }

  private Pair<String, String> resolveTownTranslated(final String town, final String country) {
    if (country == null) {
      return postalCodeService.translateTown(town);
    }
    return Pair.of(town, town);
  }

  private static String resolveCountry(final Translator translator) {
    return Optional.ofNullable(translator.getCountry()).filter(c -> !"FIN".equals(c)).orElse(null);
  }

  private Comparator<PublicTownDTO> publicTownDTOCompare() {
    return Comparator
      .comparing(
        PublicTownDTO::country,
        (a, b) -> {
          if (a == null && b != null) {
            return -1;
          }
          if (a != null && b == null) {
            return 1;
          }
          return 0;
        }
      )
      .thenComparing(PublicTownDTO::name);
  }
}
