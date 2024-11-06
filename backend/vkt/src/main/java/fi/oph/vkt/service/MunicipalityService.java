package fi.oph.vkt.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.model.Municipality;
import fi.oph.vkt.repository.MunicipalityRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MunicipalityService {

  private final MunicipalityRepository municipalityRepository;
  private Map<String, String> codeToFi;
  private Map<String, String> codeToSv;
  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
  private static final String KOODISTO_MUNICIPALITIES_JSON = "koodisto/koodisto_kunnat.json";

  @PostConstruct
  public void init() {
    codeToFi = new HashMap<>();
    codeToSv = new HashMap<>();

    try (final InputStream is = new ClassPathResource(KOODISTO_MUNICIPALITIES_JSON).getInputStream()) {
      final List<KoodistoEntry> koodisto = deserializeJson(is);
      koodisto.forEach(koodistoEntry -> {
        codeToFi.put(koodistoEntry.koodiArvo(), koodistoEntry.fi());
        codeToSv.put(koodistoEntry.koodiArvo(), koodistoEntry.sv());
      });
    } catch (final IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Transactional
  public Municipality getOrCreateByCode(final String code) {
    Optional<Municipality> existingMunicipality = municipalityRepository.findByCode(code);
    if (existingMunicipality.isPresent()) {
      return existingMunicipality.get();
    } else {
      Municipality municipality = new Municipality();
      municipality.setCode(code);
      municipality.setNameFI(codeToFi.get(code));
      municipality.setNameSV(codeToSv.get(code));
      municipalityRepository.saveAndFlush(municipality);
      return municipality;
    }
  }

  private List<KoodistoEntry> deserializeJson(final InputStream is) throws IOException {
    return OBJECT_MAPPER.readValue(is, new TypeReference<>() {});
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record KoodistoEntry(@NonNull String koodiArvo, @NonNull String fi, @NonNull String sv) {}
}
