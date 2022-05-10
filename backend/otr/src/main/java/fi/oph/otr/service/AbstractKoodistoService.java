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
import lombok.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;

public abstract class AbstractKoodistoService {

  private static final Logger LOG = LoggerFactory.getLogger(AbstractKoodistoService.class);

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
  private Map<String, Localisation> localisationByCode;

  protected void init(final String path, final Set<String> ignoredCodes) {
    try (final InputStream is = new ClassPathResource(path).getInputStream()) {
      final List<Koodisto> koodisto = deserializeJson(is)
        .stream()
        .filter(k -> !ignoredCodes.contains(k.koodiArvo))
        .toList();

      localisationByCode = koodisto.stream().collect(Collectors.toMap(Koodisto::koodiArvo, this::getLocalisation));
    } catch (final IOException e) {
      throw new RuntimeException(e);
    }
  }

  public Set<String> listKoodistoCodes() {
    return localisationByCode.keySet();
  }

  public boolean containsKoodistoCode(final String code) {
    return localisationByCode.containsKey(code);
  }

  public Optional<String> getLocalisationValue(final String code, final Language language) {
    final Localisation localisation = localisationByCode.get(code);

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
