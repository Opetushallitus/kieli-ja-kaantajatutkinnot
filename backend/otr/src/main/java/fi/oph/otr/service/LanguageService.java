package fi.oph.otr.service;

import java.util.Set;
import javax.annotation.PostConstruct;
import org.springframework.stereotype.Service;

@Service
public class LanguageService extends AbstractKoodistoService {

  static final String UNOFFICIAL_LANGUAGE = "98";
  static final String UNKNOWN_LANGUAGE = "99";
  static final String OTHER_LANGUAGE = "XX";
  private static final Set<String> IGNORED_CODES = Set.of(UNOFFICIAL_LANGUAGE, UNKNOWN_LANGUAGE, OTHER_LANGUAGE);

  @PostConstruct
  public void init() {
    init("koodisto/koodisto_kielet.json", IGNORED_CODES);
  }
}
