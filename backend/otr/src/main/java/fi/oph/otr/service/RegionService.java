package fi.oph.otr.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.otr.util.localisation.Language;
import fi.oph.otr.util.localisation.Localisation;
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
public class RegionService {

  private static final Logger LOG = LoggerFactory.getLogger(RegionService.class);

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  static final String UNKNOWN_REGION = "99";
  private static final Set<String> IGNORED_CODES = Set.of(UNKNOWN_REGION);

  private static Map<String, Localisation> localisationByCode;

  @PostConstruct
  public void init() {
    try (final InputStream is = new ClassPathResource("koodisto/koodisto_maakunta.json").getInputStream()) {
      final List<Koodisto> koodisto = deserializeJson(is)
        .stream()
        .filter(k -> !IGNORED_CODES.contains(k.koodiArvo))
        .toList();

      localisationByCode = koodisto.stream().collect(Collectors.toMap(Koodisto::koodiArvo, this::getLocalisation));
    } catch (final IOException e) {
      throw new RuntimeException(e);
    }
  }

  public Set<String> listKoodistoCodes() {
    return localisationByCode.keySet();
  }

  public Optional<String> getLocalisationValue(final String langCode, final Language language) {
    final Localisation localisation = localisationByCode.get(langCode);

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

  private List<Koodisto> deserializeJson(final InputStream is) throws IOException {
    return OBJECT_MAPPER.readValue(is, new TypeReference<>() {});
  }

  private Localisation getLocalisation(final Koodisto koodisto) {
    return Localisation
      .builder()
      .fi(findLocalisationValue(koodisto, "FI"))
      .sv(findLocalisationValue(koodisto, "SV"))
      .en(findLocalisationValue(koodisto, "EN"))
      .build();
  }

  private Optional<String> findLocalisationValue(final Koodisto koodisto, final String lang) {
    return koodisto.metadata.stream().filter(metaData -> metaData.kieli.equals(lang)).map(KoodistoMeta::nimi).findAny();
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record Koodisto(@NonNull String koodiArvo, @NonNull List<KoodistoMeta> metadata) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record KoodistoMeta(@NonNull String kieli, @NonNull String nimi) {}
}
