package fi.oph.otr.service;

import jakarta.annotation.PostConstruct;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class RegionService extends AbstractKoodistoService {

  static final String UNKNOWN_REGION = "99";
  private static final Set<String> IGNORED_CODES = Set.of(UNKNOWN_REGION);

  @PostConstruct
  public void init() {
    init("koodisto/koodisto_maakunta.json", IGNORED_CODES);
  }
}
