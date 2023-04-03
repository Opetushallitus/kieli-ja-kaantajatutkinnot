package fi.oph.akr.service.koodisto;

import jakarta.annotation.PostConstruct;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class CountryService extends AbstractKoodistoService {

  @PostConstruct
  public void init() {
    init("koodisto/koodisto_maat.json", Set.of());
  }
}
