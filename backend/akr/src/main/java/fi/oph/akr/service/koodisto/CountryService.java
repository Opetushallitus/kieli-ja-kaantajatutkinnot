package fi.oph.akr.service.koodisto;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class CountryService extends AbstractKoodistoService {

  private Map<String, String> fiToCode;
  private Map<String, String> svToCode;
  private Map<String, String> enToCode;

  @PostConstruct
  public void init() {
    init("koodisto/koodisto_maat.json", Set.of());
    fiToCode = new HashMap<>();
    svToCode = new HashMap<>();
    enToCode = new HashMap<>();
    localisationByCode.forEach((key, value) -> {
      final String fiOriginal = value.fi().orElseThrow(() -> new RuntimeException("Finnish translation expected for country code: " + key));
      final String fi = fiOriginal.toUpperCase();
      if (!fiToCode.containsKey(fi)) {
        fiToCode.put(fi, key);
      }

      final String svOriginal = value.sv().orElse(fi);
      final String sv = svOriginal.toUpperCase();
      if (!svToCode.containsKey(sv)) {
        svToCode.put(sv, key);
      }

      final String enOriginal = value.en().orElse(fi);
      final String en = enOriginal.toUpperCase();
      if (!enToCode.containsKey(en)) {
        enToCode.put(en, key);
      }
    });
  }

  public String getCountryCode(final String t) {
    if (t == null || t.isBlank()) {
      return null;
    }
    final String country = t.toUpperCase();
    if (fiToCode.containsKey(country)) {
      return fiToCode.get(country);
    }
    if (svToCode.containsKey(country)) {
      return svToCode.get(country);
    }
    if (enToCode.containsKey(country)) {
      return enToCode.get(country);
    }
    return t;
  }
}
