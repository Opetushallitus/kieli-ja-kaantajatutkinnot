package fi.oph.akt.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.akt.util.localisation.Language;
import fi.oph.akt.util.localisation.Localisation;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import lombok.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class LanguageService {

  private static final Logger LOG = LoggerFactory.getLogger(LanguageService.class);

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  static final String UNOFFICIAL_LANGUAGE = "98";
  static final String UNKNOWN_LANGUAGE = "99";
  static final String OTHER_LANGUAGE = "XX";
  static final String SIGN_LANGUAGE = "VK";

  private static final Set<String> IGNORED_LANGUAGE_CODES = Set.of(
    UNOFFICIAL_LANGUAGE,
    UNKNOWN_LANGUAGE,
    OTHER_LANGUAGE,
    SIGN_LANGUAGE
  );

  private static Map<String, Localisation> koodistoLocalisationsByLangCodes;

  @PostConstruct
  public void init() {
    try (final InputStream is = new ClassPathResource("koodisto/koodisto_kielet.json").getInputStream()) {
      final List<KoodistoLang> koodistoLangs = deserializeJson(is)
        .stream()
        .filter(k -> !IGNORED_LANGUAGE_CODES.contains(k.koodiArvo))
        .toList();

      koodistoLocalisationsByLangCodes =
        koodistoLangs.stream().collect(Collectors.toMap(KoodistoLang::koodiArvo, this::getLocalisation));
    } catch (final IOException e) {
      throw new RuntimeException(e);
    }
  }

  public Set<String> listKoodistoLangCodes() {
    return koodistoLocalisationsByLangCodes.keySet();
  }

  public Optional<String> getLocalisationValue(final String langCode, final Language language) {
    final Localisation localisation = koodistoLocalisationsByLangCodes.get(langCode);

    switch (language) {
      case FI -> {
        return localisation.fi();
      }
      case SV -> {
        return localisation.sv();
      }
      case EN -> {
        return localisation.en();
      }
      default -> {
        LOG.warn("Unknown language: " + language);
        return Optional.empty();
      }
    }
  }

  private List<KoodistoLang> deserializeJson(final InputStream is) throws IOException {
    return OBJECT_MAPPER.readValue(is, new TypeReference<>() {});
  }

  private Localisation getLocalisation(final KoodistoLang koodistoLang) {
    return Localisation
      .builder()
      .fi(findLocalisationValue(koodistoLang, "FI"))
      .sv(findLocalisationValue(koodistoLang, "SV"))
      .en(findLocalisationValue(koodistoLang, "EN"))
      .build();
  }

  private Optional<String> findLocalisationValue(final KoodistoLang koodistoLang, final String lang) {
    return koodistoLang.metadata
      .stream()
      .filter(metaData -> metaData.kieli.equals(lang))
      .map(KoodistoLangMeta::nimi)
      .findAny();
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record KoodistoLang(@NonNull String koodiArvo, @NonNull List<KoodistoLangMeta> metadata) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record KoodistoLangMeta(@NonNull String kieli, @NonNull String nimi) {}
}
