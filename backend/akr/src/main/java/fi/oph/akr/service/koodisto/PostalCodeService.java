package fi.oph.akr.service.koodisto;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PostalCodeService extends AbstractKoodistoService {

  private static final Map<String, String> FIX_NAMES_FI = Map.of("VASTAUSLÄHETYS", "HELSINKI");
  private Map<String, String> fiToSv;
  private Map<String, String> svToFi;

  @PostConstruct
  public void init() {
    init("koodisto/koodisto_postitoimipaikat.json", Set.of());
    fiToSv = new HashMap<>();
    localisationByCode
      .values()
      .forEach(v -> {
        final String fiOriginal = v.fi().orElseThrow(() -> new RuntimeException("Finnish translation expected"));
        final String fi = capitalize(FIX_NAMES_FI.getOrDefault(fiOriginal, fiOriginal).toLowerCase());
        final String sv = capitalize(v.sv().orElse(fi).toLowerCase());
        if (!fiToSv.containsKey(fi)) {
          fiToSv.put(fi, sv);
        }
        final String existingSv = fiToSv.get(fi);
        if (Objects.equals(existingSv, fi)) {
          fiToSv.put(fi, sv);
        }
      });
    svToFi = new HashMap<>();
    fiToSv.forEach((key, value) -> svToFi.put(value, key));
  }

  public Pair<String, String> translateTown(final String t, final boolean retainCase) {
    if (t == null || t.isBlank()) {
      return Pair.of("", "");
    }
    final String normalizedCase = capitalize(t.toLowerCase());
    if (fiToSv.containsKey(normalizedCase)) {
      return Pair.of(normalizedCase, fiToSv.getOrDefault(normalizedCase, normalizedCase));
    } else if (svToFi.containsKey(normalizedCase)) {
      return Pair.of(svToFi.getOrDefault(normalizedCase, normalizedCase), normalizedCase);
    }

    // If the normalized string wasn't found in translation maps,
    // return the string itself, with either normalized or the original capitalization,
    // depending on the source of the address.
    if (retainCase) {
      return Pair.of(t, t);
    } else {
      return Pair.of(normalizedCase, normalizedCase);
    }
  }

  public Pair<String, String> translateTown(final String t) {
    return translateTown(t, false);
  }

  private String capitalize(final String word) {
    final String[] parts = word.split("-");

    return Arrays.stream(parts).map(StringUtils::capitalize).collect(Collectors.joining("-"));
  }
}
