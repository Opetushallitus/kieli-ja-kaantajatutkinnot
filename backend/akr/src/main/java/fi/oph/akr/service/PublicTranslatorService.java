package fi.oph.akr.service;

import fi.oph.akr.api.dto.LanguagePairDTO;
import fi.oph.akr.api.dto.LanguagePairsDictDTO;
import fi.oph.akr.api.dto.PublicTownDTO;
import fi.oph.akr.api.dto.translator.PublicTranslatorDTO;
import fi.oph.akr.api.dto.translator.PublicTranslatorResponseDTO;
import fi.oph.akr.api.dto.translator.TranslatorAddressDTO;
import fi.oph.akr.config.CacheConfig;
import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.ContactDetailsUtil;
import fi.oph.akr.onr.OnrService;
import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.model.PersonalData;
import fi.oph.akr.repository.AuthorisationRepository;
import fi.oph.akr.repository.TranslatorLanguagePairProjection;
import fi.oph.akr.repository.TranslatorRepository;
import fi.oph.akr.service.koodisto.CountryService;
import fi.oph.akr.service.koodisto.PostalCodeService;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class PublicTranslatorService {

  private final AuthorisationRepository authorisationRepository;
  private final TranslatorRepository translatorRepository;
  private final PostalCodeService postalCodeService;
  private final CountryService countryCodeService;
  private final OnrService onrService;

  @Cacheable(cacheNames = CacheConfig.CACHE_NAME_PUBLIC_TRANSLATORS)
  @Transactional(readOnly = true)
  public PublicTranslatorResponseDTO listTranslators() {
    final Map<Long, List<TranslatorLanguagePairProjection>> translatorLanguagePairs = authorisationRepository
      .findTranslatorLanguagePairsForPublicListing()
      .stream()
      .collect(Collectors.groupingBy(TranslatorLanguagePairProjection::translatorId));

    final List<Translator> translators = translatorRepository.findAllById(translatorLanguagePairs.keySet());
    final Map<String, PersonalData> personalDatas = onrService.getCachedPersonalDatas();

    final List<Translator> translatorsWithEmail = translators
      .stream()
      .filter(t -> {
        final PersonalData personalData = personalDatas.get(t.getOnrId());
        return personalData != null && personalData.getEmail() != null;
      })
      .collect(Collectors.toCollection(ArrayList::new));

    final List<Translator> translatorsWithoutEmail = translators
      .stream()
      .filter(t -> {
        final PersonalData personalData = personalDatas.get(t.getOnrId());
        return personalData != null && personalData.getEmail() == null;
      })
      .collect(Collectors.toCollection(ArrayList::new));

    Collections.shuffle(translatorsWithEmail);
    Collections.shuffle(translatorsWithoutEmail);

    final List<PublicTranslatorDTO> publicTranslatorDTOS = Stream
      .concat(translatorsWithEmail.stream(), translatorsWithoutEmail.stream())
      .map(translator -> {
        final List<LanguagePairDTO> languagePairDTOs = getLanguagePairDTOs(translatorLanguagePairs, translator);
        final PersonalData personalData = personalDatas.get(translator.getOnrId());
        return toDTO(translator, personalData, languagePairDTOs);
      })
      .toList();

    final LanguagePairsDictDTO languagePairsDictDTO = getLanguagePairsDictDTO();
    final List<PublicTownDTO> towns = getDistinctTowns(translators, personalDatas);

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

  private PublicTranslatorDTO toDTO(
    final Translator translator,
    final PersonalData personalData,
    final List<LanguagePairDTO> languagePairDTOS
  ) {
    final TranslatorAddressDTO primaryAddress = ContactDetailsUtil.getPrimaryAddress(personalData, translator);
    final String country = getNonFinlandCountryCode(primaryAddress);
    final Pair<String, String> townTranslated = translateTown(primaryAddress);
    return PublicTranslatorDTO
      .builder()
      .id(translator.getId())
      .firstName(personalData.getFirstName())
      .lastName(personalData.getLastName())
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

  private List<PublicTownDTO> getDistinctTowns(
    final Collection<Translator> translators,
    final Map<String, PersonalData> personalDatas
  ) {
    return translators
      .stream()
      .map(translator -> {
        final PersonalData personalData = personalDatas.get(translator.getOnrId());
        final TranslatorAddressDTO primaryAddress = ContactDetailsUtil.getPrimaryAddress(personalData, translator);

        if (personalData == null || primaryAddress == null || !StringUtils.hasText(primaryAddress.town())) {
          return null;
        }
        final String country = getNonFinlandCountryCode(primaryAddress);
        final Pair<String, String> townTranslated = translateTown(primaryAddress);
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

  private Pair<String, String> translateTown(final TranslatorAddressDTO primaryAddress) {
    if (primaryAddress == null) {
      return Pair.of("", "");
    }
    final boolean retainCase = primaryAddress.source() == ContactDetailsGroupSource.AKR;
    return postalCodeService.translateTown(primaryAddress.town(), retainCase);
  }

  private String getNonFinlandCountryCode(final TranslatorAddressDTO address) {
    if (address == null) {
      return null;
    }

    final String countryCode = countryCodeService.getCountryCode(address.country());
    if (countryCode == null || countryCode.equals("FIN")) {
      return null;
    }
    return countryCode;
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
